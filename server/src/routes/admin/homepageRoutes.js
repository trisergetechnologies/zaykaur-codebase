import express from "express";
import validate from "../../middlewares/validate.js";
import { homepagePutSchema } from "../../validators/homepageSchemas.js";
import {
  getAdminHomepage,
  putAdminHomepage,
} from "../../controllers/homepageController.js";

const router = express.Router();

router.get("/", getAdminHomepage);
router.put("/", validate(homepagePutSchema), putAdminHomepage);

export default router;
