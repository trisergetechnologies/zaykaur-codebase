import express from "express";
import { addAddress, deleteAddress, getMyAddresses, setDefaultAddress, updateAddress } from "../../controllers/profile/addressController.js";

const router = express.Router();

router.get("/", getMyAddresses);
router.post("/", addAddress);
router.put("/:index", updateAddress);
router.delete("/:index", deleteAddress);
router.patch("/:index/default", setDefaultAddress);

export default router;
