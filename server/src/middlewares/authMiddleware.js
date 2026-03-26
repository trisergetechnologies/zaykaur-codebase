import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // GET shipping-label in a browser tab has no Authorization header. Allow ?access_token= or ?token= (same JWT).
    // Parse from originalUrl so query middleware cannot alter the token string.
    if (
      !token &&
      req.method === "GET" &&
      typeof req.originalUrl === "string" &&
      req.originalUrl.includes("shipping-label")
    ) {
      try {
        const u = new URL(req.originalUrl, "http://localhost");
        const q =
          u.searchParams.get("access_token") || u.searchParams.get("token");
        if (q) token = q.trim();
      } catch {
        /* ignore */
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
        data: null
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isBlocked || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
        data: null
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null
    });
  }
};
