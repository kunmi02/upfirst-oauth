import { Router, Request, Response } from "express";
import { authCodes } from "../store"; 

export const router = Router();

router.get("/authorize", (req: Request, res: Response): void => {
  const { response_type, client_id, redirect_uri, state } = req.query as {
    response_type?: string;
    client_id?: string;
    redirect_uri?: string;
    state?: string;
  };

  if (response_type !== "code") {
    res.status(400).json({ error: "Invalid response_type" });
    return;
  }

  if (!client_id || client_id !== process.env.CLIENT_ID) {
    res.status(400).json({ error: "Invalid client_id" });
    return;
  }

  if (!redirect_uri || redirect_uri !== process.env.REDIRECT_URI) {
    res.status(400).json({ error: "Invalid redirect_uri" });
    return;
  }

  const authCode = Math.random().toString(36).substring(7);
  authCodes.set(authCode, client_id);

  let redirectUrl = `${redirect_uri}?code=${authCode}`;
  if (state) redirectUrl += `&state=${state}`;

  res.redirect(redirectUrl);
});

export { router as authRouter };
