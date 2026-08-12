import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { AppError } from "../shared/AppError.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleService = {
  async verifyIdToken(idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload?.sub || !payload?.email) {
        throw new AppError("Invalid Google token", 401);
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase().trim(),
        emailVerified: payload.email_verified === true,
        firstName: payload.given_name?.trim() || undefined,
        lastName: payload.family_name?.trim() || undefined,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("Invalid Google token", 401);
    }
  },
};
