import express from "express";
import helmet from "helmet";
import eventsRouter from "./routes/events.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: "512kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      service: "zaykaur-notification-service",
      smtpConfigured: Boolean(process.env.SMTP_USER),
    });
  });

  app.use("/events", eventsRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Not found" });
  });

  return app;
}
