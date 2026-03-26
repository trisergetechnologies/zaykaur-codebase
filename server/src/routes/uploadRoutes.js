import express from "express";
import { upload, uploadMultiple } from "../services/storageService.js";
import { uploadSingle, uploadMultipleFiles } from "../controllers/uploadController.js";

const router = express.Router();

const agentLog = (payload) => {
  // #region agent log
  fetch("http://127.0.0.1:7903/ingest/c232eb23-7656-469e-86bf-c4e24659685a", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9435c8" },
    body: JSON.stringify({
      sessionId: "9435c8",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
};

const isCloudinaryConfigured = () =>
  Boolean(
    String(process.env.CLOUDINARY_CLOUD_NAME || "").trim() &&
      String(process.env.CLOUDINARY_API_KEY || "").trim() &&
      String(process.env.CLOUDINARY_API_SECRET || "").trim()
  );

/** Avoid opaque Cloudinary "Must supply api_key" when .env is incomplete. */
const requireCloudinaryEnv = (req, res, next) => {
  if (isCloudinaryConfigured()) {
    return next();
  }
  // #region agent log
  agentLog({
    hypothesisId: "H1",
    location: "uploadRoutes.js:requireCloudinaryEnv",
    message: "upload blocked: Cloudinary env incomplete",
    data: {
      hasCloudName: Boolean(String(process.env.CLOUDINARY_CLOUD_NAME || "").trim()),
      hasApiKey: Boolean(String(process.env.CLOUDINARY_API_KEY || "").trim()),
      hasApiSecret: Boolean(String(process.env.CLOUDINARY_API_SECRET || "").trim()),
    },
  });
  // #endregion
  return res.status(503).json({
    success: false,
    message:
      "File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env (see .env.example). Cloudinary dashboard: https://console.cloudinary.com",
    data: null,
  });
};

/**
 * Middleware to set the Cloudinary folder based on query param.
 * Usage: POST /api/v1/upload?folder=products
 */
const setFolder = (req, res, next) => {
  const folderMap = {
    products: "zaykaur/products",
    avatars: "zaykaur/avatars",
    sellers: "zaykaur/sellers",
    categories: "zaykaur/categories",
    documents: "zaykaur/documents",
  };
  req.uploadFolder = folderMap[req.query.folder] || "zaykaur/general";
  next();
};

const logUploadRequest = (req, _res, next) => {
  // #region agent log
  agentLog({
    hypothesisId: "H3",
    location: "uploadRoutes.js:logUploadRequest",
    message: "upload POST hit",
    data: {
      folderParam: req.query?.folder,
      contentType: String(req.headers["content-type"] || "").slice(0, 80),
      contentLength: req.headers["content-length"],
    },
  });
  // #endregion
  next();
};

const singleFileUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      // #region agent log
      agentLog({
        hypothesisId: "H2",
        location: "uploadRoutes.js:singleFileUpload",
        message: "multer middleware error",
        data: {
          errName: err?.name,
          errMsg: String(err?.message || err).slice(0, 200),
          code: err?.code,
        },
      });
      // #endregion
      return next(err);
    }
    next();
  });
};

router.post("/", requireCloudinaryEnv, logUploadRequest, setFolder, singleFileUpload, uploadSingle);
router.post("/multiple", requireCloudinaryEnv, setFolder, uploadMultiple, uploadMultipleFiles);

export default router;
