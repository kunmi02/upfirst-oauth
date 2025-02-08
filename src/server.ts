/**
 * Main server configuration file for the OAuth service
 * Sets up Express server with necessary middleware and routes
 */

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { tokenRouter } from "./routes/token";

dotenv.config();

const app = express(); // Create app but do NOT listen here

// Configure middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mount OAuth routes
app.use("/api/oauth", authRouter);
app.use("/api/oauth", tokenRouter);

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app }; // Export the app instead of starting a new instance
