import DeliveryProvider from "../../models/DeliveryProvider.js";
import Order from "../../models/Order.js";
import { createProviderShipment } from "../../lib/deliveryProviderAdapter.js";
import {
  applyOrderStatusTimestamps,
  canTransitionOrderStatus,
  deriveOrderStatusFromShipments,
} from "../../lib/orderLifecycle.js";

const getSellerItemIndexes = (order, sellerId) => {
  const indices = [];
  order.items.forEach((item, index) => {
    if (String(item.sellerId) === String(sellerId)) indices.push(index);
  });
  return indices;
};

const hasShipmentAccess = (req, shipmentSellerId) => {
  if (req.user.role === "admin" || req.user.role === "staff") return true;
  return String(req.user._id) === String(shipmentSellerId);
};

export const getOrderShipmentsForSeller = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    const shipments = (order.shipments || []).filter((shipment) =>
      hasShipmentAccess(req, shipment.sellerId)
    );

    return res.status(200).json({
      success: true,
      message: "Shipments fetched successfully",
      data: shipments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const createShipment = async (req, res) => {
  try {
    const {
      orderId,
      itemIndexes = [],
      carrierCode = "MANUAL",
      carrierName = "",
      awbNumber = "",
      trackingUrl = "",
      status = "shipped",
    } = req.body;

    if (!orderId) {
      return res.status(200).json({
        success: false,
        message: "orderId is required",
        data: null,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(200).json({
        success: false,
        message: "Cannot create shipment for cancelled order",
        data: null,
      });
    }

    const sellerId =
      req.user.role === "admin" || req.user.role === "staff"
        ? req.body.sellerId || null
        : req.user._id;

    if (!sellerId) {
      return res.status(200).json({
        success: false,
        message: "sellerId is required for admin shipment creation",
        data: null,
      });
    }
    const sellerItemIndexes = getSellerItemIndexes(order, sellerId);
    if (!sellerItemIndexes.length) {
      return res.status(200).json({
        success: false,
        message: "No order items found for this seller",
        data: null,
      });
    }

    const requestedIndexes =
      itemIndexes.length > 0
        ? itemIndexes.map((value) => Number(value)).filter((value) => !Number.isNaN(value))
        : sellerItemIndexes;

    const invalidItemIndex = requestedIndexes.some((index) => !sellerItemIndexes.includes(index));
    if (invalidItemIndex) {
      return res.status(200).json({
        success: false,
        message: "itemIndexes contain items not owned by this seller",
        data: null,
      });
    }

    const hasOverlappingShipment = (order.shipments || []).some((shipment) => {
      if (String(shipment.sellerId) !== String(sellerId)) return false;
      const shipmentItems = shipment.items || [];
      return shipmentItems.some((index) => requestedIndexes.includes(index)) && shipment.status !== "cancelled";
    });

    if (hasOverlappingShipment) {
      return res.status(200).json({
        success: false,
        message: "Some items are already assigned to an active shipment",
        data: null,
      });
    }

    let provider = null;
    if (carrierCode !== "MANUAL") {
      provider = await DeliveryProvider.findOne({
        code: carrierCode,
        isActive: true,
      });
      if (!provider) {
        return res.status(200).json({
          success: false,
          message: "Invalid or inactive delivery provider",
          data: null,
        });
      }
    }

    const providerResponse = await createProviderShipment({
      provider,
      order,
      sellerId: String(sellerId),
    });

    const now = new Date();
    order.shipments.push({
      sellerId,
      items: requestedIndexes,
      status,
      carrierCode,
      carrierName: carrierName || provider?.name || carrierCode,
      awbNumber: providerResponse?.awbNumber || awbNumber || "",
      trackingUrl: providerResponse?.trackingUrl || trackingUrl || "",
      providerId: provider?._id || null,
      dispatchedAt: status === "shipped" ? now : null,
      deliveredAt: status === "delivered" ? now : null,
      events: [
        {
          at: now,
          status,
          location: req.body.location || "",
          description: req.body.description || "Shipment created",
        },
      ],
    });

    const derivedOrderStatus = deriveOrderStatusFromShipments(order.shipments, order.orderStatus);
    order.orderStatus = derivedOrderStatus;
    applyOrderStatusTimestamps(order, derivedOrderStatus, now);
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Shipment created successfully",
      data: order.shipments[order.shipments.length - 1],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const { orderId, shipmentId } = req.params;
    const { status, location = "", description = "" } = req.body;

    if (!status) {
      return res.status(200).json({
        success: false,
        message: "status is required",
        data: null,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    const shipment = order.shipments.id(shipmentId);
    if (!shipment) {
      return res.status(200).json({
        success: false,
        message: "Shipment not found",
        data: null,
      });
    }

    if (!hasShipmentAccess(req, shipment.sellerId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this shipment",
        data: null,
      });
    }

    if (!canTransitionOrderStatus(shipment.status, status)) {
      return res.status(200).json({
        success: false,
        message: `Invalid shipment status transition from '${shipment.status}' to '${status}'`,
        data: null,
      });
    }

    const now = new Date();
    shipment.status = status;
    if (status === "shipped" && !shipment.dispatchedAt) shipment.dispatchedAt = now;
    if (status === "delivered" && !shipment.deliveredAt) shipment.deliveredAt = now;
    shipment.events.push({
      at: now,
      status,
      location,
      description: description || "Shipment status updated",
    });

    const derivedOrderStatus = deriveOrderStatusFromShipments(order.shipments, order.orderStatus);
    if (canTransitionOrderStatus(order.orderStatus, derivedOrderStatus) || derivedOrderStatus === order.orderStatus) {
      order.orderStatus = derivedOrderStatus;
      applyOrderStatusTimestamps(order, derivedOrderStatus, now);
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Shipment updated successfully",
      data: shipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
