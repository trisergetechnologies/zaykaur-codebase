/**
 * Load server/.env before any other local module reads process.env.
 * dotenv.config() alone uses process.cwd(), which breaks when Node is started
 * from the monorepo root; and default import order previously ran Cloudinary
 * config before dotenv ran in server.js.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
