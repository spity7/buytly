import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";
import { generatePasswordResetToken } from "../src/services/token.service.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

describe.skipIf(!mongoAvailable)("auth password recovery", () => {
  it("resets password with a valid token and rejects old login", async () => {
    const app = await getApp();
    const email = "reset-user@example.com";
    const oldPassword = "password123";

    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: oldPassword,
        confirmPassword: oldPassword,
        firstName: "Reset",
        role: "buyer",
      });

    const { token, hashed, expires } = generatePasswordResetToken();
    await User.findOneAndUpdate(
      { email },
      {
        passwordResetToken: hashed,
        passwordResetExpires: expires,
      },
    );

    const resetRes = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "newpassword123" });

    expect(resetRes.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: oldPassword });

    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "newpassword123" });

    expect(newLogin.status).toBe(200);
  });

  it("returns a generic message for forgot-password", async () => {
    const app = await getApp();

    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "missing-user@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.data?.message || res.body.message).toMatch(
      /reset link has been sent/i,
    );
  });

  it("logs out by revoking refresh tokens", async () => {
    const app = await getApp();
    const email = "logout-user@example.com";

    const registered = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        confirmPassword: "password123",
        role: "buyer",
      });

    const refreshToken = registered.body.data.refreshToken;

    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken });

    expect(refreshRes.status).toBe(401);
  });
});
