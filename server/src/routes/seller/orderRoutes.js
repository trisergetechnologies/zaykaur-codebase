    import express from "express";
    import { getSellerOrders } from "../../controllers/seller/sellerOrderController.js";
    import { downloadShippingLabelPdf } from "../../controllers/seller/sellerShippingLabelController.js";

    const router = express.Router();

    router.get("/:orderId/shipping-label", downloadShippingLabelPdf);
    router.get("/", getSellerOrders);

    export default router;
