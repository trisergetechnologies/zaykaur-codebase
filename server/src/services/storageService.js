import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.uploadFolder || "zaykaur/general";
    const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif", "pdf"];
    const ext = file.originalname.split(".").pop().toLowerCase();
    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "storageService.js:CloudinaryStorage.params",
      message: "cloudinary params computed",
      data: {
        folder,
        mimetype: file?.mimetype,
        ext,
        origLen: file?.originalname != null ? String(file.originalname).length : -1,
        cloudNameSet: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
        apiKeySet: Boolean(process.env.CLOUDINARY_API_KEY),
        apiSecretSet: Boolean(process.env.CLOUDINARY_API_SECRET),
      },
    });
    // #endregion

    return {
      folder,
      allowed_formats: allowedFormats,
      format: allowedFormats.includes(ext) ? ext : "webp",
      transformation:
        file.mimetype.startsWith("image/")
          ? [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }]
          : undefined,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("files", 10);

export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
