import { config } from "dotenv";
import { initServer } from "./configs/server.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
config()
initServer()