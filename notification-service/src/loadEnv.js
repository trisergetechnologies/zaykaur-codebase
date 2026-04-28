/**
 * Load notification-service/.env regardless of process.cwd() (e.g. when started
 * from monorepo root). Mirrors server/src/loadEnv.js.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
