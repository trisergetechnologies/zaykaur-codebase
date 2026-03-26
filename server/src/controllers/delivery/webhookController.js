import IdempotencyKey from "../../models/IdempotencyKey.js";
import Order from "../../models/Order.js";
import {
  applyOrderStatusTimestamps,
  canTransitionOrderStatus,
  deriveOrderStatusFromShipments,
} from "../../lib/orderLifecycle.js";

const ensureWebhookAuthorized = (req) => {
  const expectedSecret = process.env.DELIVERY_WEBHOOK_SECRET;
  if (!expectedSecret) return true;
  return req.headers["x-delivery-webhook-secret"] === expectedSecret;
};

const reserveIdempotencyKey = async (providerCode, key) => {
  try {
    await IdempotencyKey.create({
      key: `${providerCode}:${key}`,
      createdAt: new Date(),
    });
    return { ok: true, duplicate: false };
  } catch (error) {
    if (error?.code === 11000) {
      return { ok: true, duplicate: true };
    }
    return { ok: false, duplicate: false, message: error.message };
  }
};

export const handleDeliveryWebhook = async (req, res) => {
  try {
    if (!ensureWebhookAuthorized(req)) {
      return res.status(401).json({
        success: false,
        message: "Invalid delivery webhook secret",
        data: null,
      });
    }

    const providerCode = String(req.params.providerCode || "").toUpperCase().trim();
    if (!providerCode) {
      return res.status(200).json({
        success: false,
        message: "providerCode is required",
        data: null,
      });
    }

    const idempotencyInput =
      req.headers["x-idempotency-key"] ||
      req.body?.idempotencyKey ||
      req.body?.eventId ||
      req.body?.providerEventId;

    if (!idempotencyInput) {
      return res.status(200).json({
        success: false,
        message: "idempotency key is required",
        data: null,
      });
    }

    const idempotencyResult = await reserveIdempotencyKey(providerCode, idempotencyInput);
    if (!idempotencyResult.ok) {
      return res.status(500).json({
        success: false,
        message: idempotencyResult.message || "Failed to reserve idempotency key",
        data: null,
      });
    }

    if (idempotencyResult.duplicate) {
      return res.status(200).json({
        success: true,
        message: "Duplicate webhook ignored",
        data: { duplicate: true },
      });
    }

    const { awbNumber, orderId, shipmentId, status, location = "", description = "" } = req.body || {};
    if (!status) {
      return res.status(200).json({
        success: false,
        message: "status is required",
        data: null,
      });
    }

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (awbNumber) {
      order = await Order.findOne({ "shipments.awbNumber": awbNumber });
    }

    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found for webhook payload",
        data: null,
      });
    }

    let shipment = null;
    if (shipmentId) {
      shipment = order.shipments.id(shipmentId);
    } else if (awbNumber) {
      shipment = order.shipments.find(
        (value) => value.awbNumber === awbNumber && String(value.carrierCode || "").toUpperCase() === providerCode
      );
    }

    if (!shipment) {
      return res.status(200).json({
        success: false,
        message: "Shipment not found for webhook payload",
        data: null,
      });
    }

    if (!canTransitionOrderStatus(shipment.status, status) && shipment.status !== status) {
      return res.status(200).json({
        success: false,
        message: `Invalid shipment status transition from '${shipment.status}' to '${status}'`,
        data: null,
      });
    }

    const now = req.body?.eventAt ? new Date(req.body.eventAt) : new Date();
    shipment.status = status;
    if (status === "shipped" && !shipment.dispatchedAt) shipment.dispatchedAt = now;
    if (status === "delivered" && !shipment.deliveredAt) shipment.deliveredAt = now;
    shipment.events.push({
      at: now,
      status,
      location,
      description: description || "Webhook event received",
    });

    const derivedOrderStatus = deriveOrderStatusFromShipments(order.shipments, order.orderStatus);
    if (
      canTransitionOrderStatus(order.orderStatus, derivedOrderStatus) ||
      order.orderStatus === derivedOrderStatus
    ) {
      order.orderStatus = derivedOrderStatus;
      applyOrderStatusTimestamps(order, derivedOrderStatus, now);
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        orderId: order._id,
        shipmentId: shipment._id,
        status: shipment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
