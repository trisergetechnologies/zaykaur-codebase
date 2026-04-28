import "./loadEnv.js";
import logger from "./logger.js";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5055;

createApp().listen(PORT, () => {
  logger.info({ PORT }, "notification-service listening");
});
