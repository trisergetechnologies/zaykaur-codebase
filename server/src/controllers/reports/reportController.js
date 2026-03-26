import mongoose from "mongoose";

import Order from "../../models/Order.js";
import TaxRule from "../../models/TaxRule.js";
import User from "../../models/User.js";
import {
  buildPeriodKey,
  buildTaxBreakdown,
  getOrderReturnedFlag,
  normalizeReportPeriod,
  parseDate,
} from "../../lib/reportingHelpers.js";

const buildReportRows = async ({ sellerId, from, to, invoiceNumber }) => {
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = from;
    if (to) match.createdAt.$lte = to;
  }
  if (invoiceNumber) {
    match.orderNumber = { $regex: invoiceNumber.trim(), $options: "i" };
  }

  const pipeline = [
    { $match: match },
    { $unwind: "$items" },
  ];

  if (sellerId) {
    pipeline.push({
      $match: {
        "items.sellerId": new mongoose.Types.ObjectId(String(sellerId)),
      },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          orderId: "$_id",
          sellerId: "$items.sellerId",
        },
        orderId: { $first: "$_id" },
        sellerId: { $first: "$items.sellerId" },
        invoiceNumber: { $first: "$orderNumber" },
        orderDate: { $first: "$createdAt" },
        orderStatus: { $first: "$orderStatus" },
        paymentStatus: { $first: "$paymentStatus" },
        currency: { $first: "$currency" },
        shipments: { $first: "$shipments" },
        subtotal: {
          $sum: {
            $multiply: ["$items.unitPrice", "$items.quantity"],
          },
        },
        taxTotal: { $sum: "$items.taxAmount" },
        grandTotal: { $sum: "$items.lineTotal" },
        taxLines: {
          $push: {
            taxCode: "$items.taxCode",
            taxType: "$items.taxType",
            taxRate: "$items.taxRate",
            taxAmount: "$items.taxAmount",
          },
        },
      },
    },
    { $sort: { orderDate: -1 } }
  );

  return Order.aggregate(pipeline);
};

const buildSummaryRows = (rows, period) => {
  const grouped = new Map();
  for (const row of rows) {
    const periodKey = buildPeriodKey(row.orderDate, period);
    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, {
        period: periodKey,
        totalInvoices: 0,
        returnedInvoices: 0,
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
      });
    }
    const bucket = grouped.get(periodKey);
    bucket.totalInvoices += 1;
    bucket.returnedInvoices += row.isReturned ? 1 : 0;
    bucket.subtotal += row.subtotal;
    bucket.taxTotal += row.taxTotal;
    bucket.grandTotal += row.grandTotal;
  }

  return [...grouped.values()].sort((a, b) => b.period.localeCompare(a.period));
};

const mergeTaxBreakdown = (rows) => {
  const grouped = new Map();
  for (const row of rows) {
    for (const tax of row.taxBreakdown) {
      const key = `${tax.type}:${tax.code}`;
      if (!grouped.has(key)) {
        grouped.set(key, { ...tax, amount: 0 });
      }
      grouped.get(key).amount += Number(tax.amount || 0);
    }
  }
  return [...grouped.values()].sort((a, b) => a.code.localeCompare(b.code));
};

const toDateRange = (fromQuery, toQuery) => {
  const from = parseDate(fromQuery);
  const to = parseDate(toQuery);
  if (!to) return { from, to: null };

  // Make "to" inclusive for date-only values.
  const inclusiveTo = new Date(to);
  inclusiveTo.setUTCHours(23, 59, 59, 999);
  return { from, to: inclusiveTo };
};

const buildSalesReport = async ({
  sellerId,
  period,
  from,
  to,
  invoiceNumber,
  page,
  limit,
}) => {
  const rows = await buildReportRows({ sellerId, from, to, invoiceNumber });
  const taxCodes = new Set();
  const sellerIds = new Set();

  for (const row of rows) {
    sellerIds.add(String(row.sellerId));
    for (const taxLine of row.taxLines || []) {
      if (taxLine.taxCode) taxCodes.add(taxLine.taxCode);
    }
  }

  const [taxRules, sellerUsers] = await Promise.all([
    taxCodes.size
      ? TaxRule.find({ code: { $in: [...taxCodes] } }).select("code type").lean()
      : [],
    sellerIds.size
      ? User.find({ _id: { $in: [...sellerIds] } }).select("name").lean()
      : [],
  ]);

  const taxRuleByCode = new Map(taxRules.map((rule) => [rule.code, rule]));
  const sellerNameById = new Map(
    sellerUsers.map((user) => [String(user._id), user.name || "Unknown Seller"])
  );

  const enrichedRows = rows.map((row) => {
    const isReturned = getOrderReturnedFlag(row.orderStatus, row.shipments, row.sellerId);
    const taxBreakdown = buildTaxBreakdown(row.taxLines || [], taxRuleByCode);
    return {
      orderId: row.orderId,
      sellerId: row.sellerId,
      sellerName: sellerNameById.get(String(row.sellerId)) || "Unknown Seller",
      invoiceNumber: row.invoiceNumber,
      orderDate: row.orderDate,
      orderStatus: row.orderStatus,
      paymentStatus: row.paymentStatus,
      returnStatus: isReturned ? "returned" : "not_returned",
      isReturned,
      subtotal: Number(row.subtotal || 0),
      taxTotal: Number(row.taxTotal || 0),
      grandTotal: Number(row.grandTotal || 0),
      currency: row.currency || "INR",
      taxBreakdown,
    };
  });

  const totalInvoices = enrichedRows.length;
  const skip = (page - 1) * limit;
  const pagedInvoices = enrichedRows.slice(skip, skip + limit);
  const summary = buildSummaryRows(enrichedRows, period);
  const taxBreakdown = mergeTaxBreakdown(enrichedRows);
  const totals = enrichedRows.reduce(
    (acc, row) => {
      acc.subtotal += row.subtotal;
      acc.taxTotal += row.taxTotal;
      acc.grandTotal += row.grandTotal;
      acc.returnedInvoices += row.isReturned ? 1 : 0;
      return acc;
    },
    { subtotal: 0, taxTotal: 0, grandTotal: 0, returnedInvoices: 0 }
  );

  return {
    period,
    summary,
    taxBreakdown,
    totals: {
      ...totals,
      totalInvoices,
    },
    invoices: {
      items: pagedInvoices,
      pagination: {
        total: totalInvoices,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(totalInvoices / limit)),
      },
    },
  };
};

const parseReportParams = (req) => {
  const period = normalizeReportPeriod(req.query.period);
  const { from, to } = toDateRange(req.query.from, req.query.to);
  const invoiceNumber = req.query.invoiceNumber || req.query.invoice || "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 200);
  return { period, from, to, invoiceNumber, page, limit };
};

export const getSellerReportSummary = async (req, res) => {
  try {
    const params = parseReportParams(req);
    const report = await buildSalesReport({
      ...params,
      sellerId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Seller report fetched successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getAdminReportSummary = async (req, res) => {
  try {
    const params = parseReportParams(req);
    const sellerId = req.query.sellerId || null;
    if (sellerId && !mongoose.Types.ObjectId.isValid(String(sellerId))) {
      return res.status(200).json({
        success: false,
        message: "Invalid sellerId",
        data: null,
      });
    }
    const report = await buildSalesReport({
      ...params,
      sellerId,
    });

    return res.status(200).json({
      success: true,
      message: "Admin report fetched successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getSellerInvoiceReport = async (req, res) => {
  try {
    const params = parseReportParams(req);
    const report = await buildSalesReport({
      ...params,
      sellerId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Seller invoice report fetched successfully",
      data: report.invoices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getAdminInvoiceReport = async (req, res) => {
  try {
    const params = parseReportParams(req);
    const sellerId = req.query.sellerId || null;
    if (sellerId && !mongoose.Types.ObjectId.isValid(String(sellerId))) {
      return res.status(200).json({
        success: false,
        message: "Invalid sellerId",
        data: null,
      });
    }
    const report = await buildSalesReport({
      ...params,
      sellerId,
    });

    return res.status(200).json({
      success: true,
      message: "Admin invoice report fetched successfully",
      data: report.invoices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
