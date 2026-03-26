import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import { resolveVariant } from "../../lib/variantHelpers.js";

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId", "name slug category status")
      .populate("items.sellerId", "name");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {
          items: [],
          itemsTotal: 0,
          taxTotal: 0,
          shippingEstimate: 0,
          grandTotal: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, variantAttributes, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(200).json({
        success: false,
        message: "Product ID is required",
        data: null
      });
    }

    const product = await Product.findById(productId).select("name slug seller category status variants");

    if (!product || product.status !== "active" || product.isDeleted) {
      return res.status(200).json({
        success: false,
        message: "Product not available",
        data: null
      });
    }

    const { variant } = resolveVariant(
      product,
      variantId,
      variantAttributes && typeof variantAttributes === "object" ? variantAttributes : undefined
    );

    if (!variant || !variant.isActive) {
      return res.status(200).json({
        success: false,
        message: "Variant not available",
        data: null
      });
    }

    if (variant.stock < quantity) {
      return res.status(200).json({
        success: false,
        message: "Insufficient stock",
        data: null
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [], itemsTotal: 0, taxTotal: 0, shippingEstimate: 0, grandTotal: 0 });
    }

    const itemIndex = cart.items.findIndex(
      (i) =>
        i.productId.toString() === productId &&
        (i.variantId?.toString() || "") === (variant._id.toString())
    );

    const imageUrl = variant.images?.[0]?.url || "";

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].unitPrice = variant.price;
      cart.items[itemIndex].name = product.name;
      cart.items[itemIndex].image = imageUrl;
    } else {
      cart.items.push({
        productId: product._id,
        variantId: variant._id,
        quantity,
        sellerId: product.seller,
        addedAt: new Date(),
        unitPrice: variant.price,
        name: product.name,
        image: imageUrl
      });
    }

    cart.itemsTotal = cart.items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
    cart.taxTotal = Math.round(cart.itemsTotal * 0.05);
    cart.shippingEstimate = cart.itemsTotal >= 999 ? 0 : 80;
    cart.grandTotal = cart.itemsTotal + cart.taxTotal + cart.shippingEstimate;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(200).json({
        success: false,
        message: "Cart not found",
        data: null
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter((item) => {
      if (item.productId.toString() !== productId) return true;
      if (variantId && item.variantId?.toString() !== variantId) return true;
      if (!variantId && !item.variantId) return false;
      if (!variantId) return true;
      return false;
    });

    if (cart.items.length === initialLength) {
      return res.status(200).json({
        success: false,
        message: "Product not found in cart",
        data: null
      });
    }

    cart.itemsTotal = cart.items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
    cart.taxTotal = Math.round(cart.itemsTotal * 0.05);
    cart.shippingEstimate = cart.itemsTotal >= 999 ? 0 : 80;
    cart.grandTotal = cart.itemsTotal + cart.taxTotal + cart.shippingEstimate;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
