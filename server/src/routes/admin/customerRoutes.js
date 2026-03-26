import express from "express";
import { getAdminCustomers, blockUnblockCustomer } from "../../controllers/admin/customerAdminController.js";

const router = express.Router();

router.get("/", getAdminCustomers);
router.patch("/:customerId/block", blockUnblockCustomer);

export default router;
