import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import SellerProfile from "../../models/SellerProfile.js";

/**
 * PDF shipping label (4×6 in) for courier — seller's lines only, like marketplace packing slips.
 */
export const downloadShippingLabelPdf = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(String(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
        data: null,
      });
    }

    let targetSellerId = req.user._id;
    if (req.user.role === "admin" || req.user.role === "staff") {
      const q = req.query.sellerId;
      if (!q || !mongoose.Types.ObjectId.isValid(String(q))) {
        return res.status(400).json({
          success: false,
          message: "For admin, pass sellerId query (which seller's package this label is for).",
          data: null,
        });
      }
      targetSellerId = q;
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    const sameSeller = (a, b) => {
      if (a == null || b == null) return false;
      try {
        return new mongoose.Types.ObjectId(String(a)).equals(
          new mongoose.Types.ObjectId(String(b))
        );
      } catch {
        return String(a) === String(b);
      }
    };

    let sellerItems = (order.items || []).filter((item) =>
      sameSeller(item?.sellerId, targetSellerId)
    );

    // Legacy lines missing sellerId: resolve seller from Product (same as checkout uses product.seller).
    if (!sellerItems.length && order.items?.length) {
      const pids = [
        ...new Set(
          order.items.map((i) => i.productId).filter(Boolean).map(String)
        ),
      ];
      if (pids.length) {
        const oidList = pids
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));
        if (oidList.length) {
          const products = await Product.find({
            _id: { $in: oidList },
          })
            .select("seller")
            .lean();
          const sellerByProduct = new Map(
            products.map((p) => [String(p._id), p.seller])
          );
          sellerItems = order.items.filter((item) => {
            const fromLine = item.sellerId;
            const fromProduct = item.productId
              ? sellerByProduct.get(String(item.productId))
              : null;
            const effective = fromLine ?? fromProduct;
            return sameSeller(effective, targetSellerId);
          });
        }
      }
    }

    if (!sellerItems.length) {
      return res.status(400).json({
        success: false,
        message: "No items in this order belong to this seller account",
        data: null,
      });
    }

    const addr = order.shippingAddress || {};
    const profile = await SellerProfile.findOne({
      userId: targetSellerId,
      isDeleted: { $ne: true },
    })
      .select("shopName gstin")
      .lean();

    const filename = `ZayKaur-shipping-label-${order.orderNumber || orderId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({
      size: [288, 432],
      margin: 18,
      info: {
        Title: `Shipping label ${order.orderNumber || ""}`,
        Author: "ZayKaur",
      },
    });

    doc.pipe(res);

    doc.fontSize(13).font("Helvetica-Bold").text("ZAYKAUR", { align: "center" });
    doc.moveDown(0.2);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#444444")
      .text("Shipping label — print & stick on package", { align: "center" });
    doc.fillColor("#000000");
    doc.moveDown(0.4);

    doc.fontSize(9).font("Helvetica-Bold").text(`Order: ${order.orderNumber || orderId}`);
    doc
      .fontSize(7)
      .font("Helvetica")
      .text(`Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`);
    doc.moveDown(0.35);

    if (profile?.shopName) {
      doc.fontSize(7).font("Helvetica").text(`Ship from: ${profile.shopName}`);
      if (profile.gstin) doc.text(`GSTIN: ${profile.gstin}`);
      doc.moveDown(0.35);
    }

    doc.fontSize(10).font("Helvetica-Bold").text("DELIVER TO");
    doc.fontSize(10).font("Helvetica-Bold").text(addr.fullName || "—");
    doc.fontSize(9).font("Helvetica").text(`Phone: ${addr.phone || "—"}`);
    const line = [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
      .filter(Boolean)
      .join(", ");
    doc.fontSize(9).font("Helvetica").text(line || "—", { width: 248 });
    doc.moveDown(0.45);

    doc.fontSize(9).font("Helvetica-Bold").text("ITEMS IN THIS PACKAGE");
    sellerItems.forEach((item, i) => {
      const name = item.name || item.productSnapshot?.name || "Product";
      const short = name.length > 42 ? `${name.slice(0, 42)}…` : name;
      doc.fontSize(7).font("Helvetica").text(`${i + 1}. ${short}`);
      doc.text(`   SKU ${item.sku ?? "—"}  ·  Qty ${item.quantity}`);
    });

    doc.moveDown(0.5);
    doc
      .fontSize(6)
      .font("Helvetica")
      .fillColor("#666666")
      .text(
        "Use waterproof pouch or clear tape over label. Ensure address is readable.",
        { width: 248, align: "left" }
      );
    doc.fillColor("#000000");

    doc.moveDown(0.4);
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(String(order.orderNumber || orderId), { align: "center" });
    doc
      .fontSize(6)
      .font("Helvetica")
      .text("Order reference (share with courier if needed)", { align: "center" });

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
    res.end();
  }
};
