import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "development" ? "debug" : "info"),
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } }
      : undefined,
  base: { service: "zaykaur-server" },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

export default logger;
