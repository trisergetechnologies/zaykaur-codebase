/**
 * Generic file upload controller.
 * Supports single and multiple file uploads via Cloudinary.
 */

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

export const uploadSingle = async (req, res) => {
  try {
    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "uploadController.js:uploadSingle",
      message: "uploadSingle after multer",
      data: {
        hasFile: Boolean(req.file),
        pathLen: req.file?.path != null ? String(req.file.path).length : 0,
        size: req.file?.size,
      },
    });
    // #endregion
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "uploadController.js:uploadSingle.catch",
      message: "uploadSingle threw",
      data: {
        errName: error?.name,
        errMsg: String(error?.message || error).slice(0, 200),
      },
    });
    // #endregion
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
        data: null,
      });
    }

    const files = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    return res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      data: files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
