/**
 * Test suite for OAuth Token Endpoint
 * Tests the token exchange functionality using authorization codes
 */

import request from "supertest";
import { app } from "../src/server";
import querystring from "querystring"; // Import querystring to encode form data

describe("OAuth Token Endpoint", () => {
  let validCode: string;

  // Set up test environment before each test
  beforeAll(async () => {
    // Get a valid authorization code by making an authorize request
    const res = await request(app).get("/api/oauth/authorize").query({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
    });
    const redirectUrl = new URL(res.header.location);
    validCode = redirectUrl.searchParams.get("code")!;
  });

  // Test case: Missing authorization code
  it("should return 400 for missing authorization code", async () => {
    const res = await request(app).post("/api/oauth/token").send({
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Missing required parameters");
  });

  // Test case: Invalid authorization code
  it("should return 400 for invalid authorization code", async () => {
    const res = await request(app).post("/api/oauth/token").send({
      grant_type: "authorization_code",
      code: "INVALID_CODE",
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid authorization code");
  });

  // Test case: Successful token exchange
  it("should exchange a valid authorization code for an access token", async () => {

    const res = await request(app)
    .post("/api/oauth/token")
    .set("Content-Type", "application/x-www-form-urlencoded") // Explicitly set the header
    .send(
      querystring.stringify({ // Convert JSON body to form-urlencoded
        grant_type: "authorization_code",
        code: validCode,
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
      })
    );

    console.log("Response body:", res.body);


    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("token_type", "bearer");
    expect(res.body).toHaveProperty("expires_in");
  });
});
