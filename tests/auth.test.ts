/**
 * Test suite for OAuth Authorization Endpoint
 * Tests the authorization code generation and validation
 */

import request from "supertest";
import { app } from "../src/server";
import { authCodes } from "../src/store";

describe("OAuth Authorization Endpoint", () => {
  // Clean up after each test
  afterEach(() => {
    authCodes.clear(); // Clear stored authorization codes after each test
  });

  // Test case: Missing client_id parameter
  it("should return 400 for missing client_id", async () => {
    const res = await request(app).get("/api/oauth/authorize").query({
      response_type: "code",
      redirect_uri: "http://localhost:8081/process",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid client_id");
  });

  // Test case: Invalid response_type
  it("should return 400 for invalid response_type", async () => {
    const res = await request(app).get("/api/oauth/authorize").query({
      response_type: "invalid_type",
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid response_type");
  });

  // Test case: Successful authorization code generation
  it("should generate an authorization code and redirect", async () => {
    const res = await request(app).get("/api/oauth/authorize").query({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
    });

    expect(res.status).toBe(302); // Expect redirect
    const redirectUrl = new URL(res.header.location);
    expect(redirectUrl.searchParams.has("code")).toBeTruthy();

    // Verify auth code is stored
    const code = redirectUrl.searchParams.get("code");
    expect(authCodes.has(code!)).toBeTruthy();
  });
});
