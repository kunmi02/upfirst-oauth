/**
 * OAuth 2.0 Token Endpoint
 * Handles token exchange requests using the authorization code grant type
 */

import { Router, Request, Response } from "express";
import { SignJWT } from "jose";
import { authCodes } from "../store"; // Import shared store

/**
 * Express router for token endpoint
 */
export const router = Router();

/**
 * Handles token exchange requests using the authorization code grant type
 */
router.post("/token", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract required parameters from request body
    const { grant_type, code, client_id, redirect_uri } = req.body;

    // Validate that all required parameters are present
    if (!grant_type || !code || !client_id || !redirect_uri) {
      res.status(400).json({ error: "Missing required parameters" });
      return
    }

    // Verify the grant type is authorization_code
    if (grant_type !== "authorization_code") {
      res.status(400).json({ error: "Invalid grant_type" });
      return;
    }

    // Verify the authorization code exists in our store
    if (!authCodes.has(code)) {
      res.status(400).json({ error: "Invalid authorization code" });
      return;
    }

    // Verify client_id and redirect_uri match expected values
    if (client_id !== process.env.CLIENT_ID || redirect_uri !== process.env.REDIRECT_URI) {
      res.status(400).json({ error: "Invalid client_id or redirect_uri" });
      return;
    }

    // Remove the used authorization code
    authCodes.delete(code);

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ client_id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    // Return the access token response
    res.json({
      access_token: token,
      token_type: "bearer",
      expires_in: 3600,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Export the token router
 */
export { router as tokenRouter };
