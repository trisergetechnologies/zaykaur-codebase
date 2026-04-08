/**
 * Proxy request to backend Server or Python service.
 * All client traffic hits gateway only; no direct Server URL exposure.
 */

import axios from "axios";
import config from "../config/index.js";

const serverClient = axios.create({
  baseURL: config.serverUrl,
  timeout: 30000,
  validateStatus: () => true,
  headers: { "X-Forwarded-By": "zaykaur-gateway" },
});

const pythonClient = config.pythonServiceUrl
  ? axios.create({
      baseURL: config.pythonServiceUrl,
      timeout: 15000,
      validateStatus: () => true,
    })
  : null;

/**
 * Proxy to Server (default for /api/v1 except recommendations).
 */
export async function proxyToServer(req, res) {
  const path = req.originalUrl || req.url || "";
  const method = (req.method || "GET").toLowerCase();

  const headers = { ...req.headers };
  delete headers.host;
  delete headers["content-length"];
  if (req.requestId) {
    headers["X-Request-Id"] = req.requestId;
  }

  try {
    const response = await serverClient.request({
      method,
      url: path,
      params: req.query,
      data: req.body,
      headers,
      responseType: "json",
    });

    res.status(response.status).json(response.data ?? {});
  } catch (err) {
    res.status(502).json({
      success: false,
      message: "Backend unavailable",
      data: null,
    });
  }
}

/**
 * Proxy to Python recommendation service. If PYTHON_SERVICE_URL not set, return 501.
 */
export async function proxyToPython(req, res) {
  if (!pythonClient) {
    return res.status(501).json({
      success: false,
      message: "Recommendation service not configured",
      data: null,
    });
  }

  const path = req.url?.replace(/^\/api\/v1\/recommendations/, "") || "/";
  const method = (req.method || "GET").toLowerCase();

  const pyHeaders = { ...req.headers, host: undefined };
  if (req.requestId) {
    pyHeaders["X-Request-Id"] = req.requestId;
  }

  try {
    const response = await pythonClient.request({
      method,
      url: path || "/",
      params: req.query,
      data: req.body,
      headers: pyHeaders,
      responseType: "json",
    });
    res.status(response.status).json(response.data ?? {});
  } catch (err) {
    res.status(502).json({
      success: false,
      message: "Recommendation service unavailable",
      data: null,
    });
  }
}
