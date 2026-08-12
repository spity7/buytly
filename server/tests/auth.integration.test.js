import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";
import { AgentProfile } from "../src/modules/agents/agent.model.js";
import { hashToken } from "../src/services/token.service.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerPayload = (overrides = {}) => ({
  email: "buyer@example.com",
  password: "password123",
  confirmPassword: "password123",
  firstName: "Test",
  role: "buyer",
  ...overrides,
});

describe.skipIf(!mongoAvailable)("auth API", () => {
  it("registers a new user and returns tokens", async () => {
    const app = await getApp();
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email: "buyer@example.com" }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTypeOf("string");
    expect(res.body.data.refreshToken).toBeTypeOf("string");
    expect(res.body.data.user.email).toBe("buyer@example.com");
    expect(res.body.data.user.isEmailVerified).toBe(false);
  });

  it("rejects registration when passwords do not match", async () => {
    const app = await getApp();
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "mismatch@example.com",
      password: "password123",
      confirmPassword: "different123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects duplicate registration", async () => {
    const app = await getApp();
    const payload = registerPayload({ email: "dup@example.com" });

    await request(app).post("/api/v1/auth/register").send(payload);
    const res = await request(app).post("/api/v1/auth/register").send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("creates agent profile when registering as agent", async () => {
    const app = await getApp();
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(
        registerPayload({
          email: "agent@example.com",
          role: "agent",
        }),
      );

    expect(res.status).toBe(201);
    const userId = res.body.data.user.id;
    const profile = await AgentProfile.findOne({ userId });
    expect(profile).not.toBeNull();
  });

  it("verifies email with valid token", async () => {
    const app = await getApp();
    const email = "verify@example.com";
    const plainToken = "test-verification-token-hex-value";

    await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email }));

    const user = await User.findOne({ email }).select(
      "+emailVerificationToken",
    );
    user.emailVerificationToken = hashToken(plainToken);
    user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: plainToken });

    expect(res.status).toBe(200);
    expect(res.body.data.user.isEmailVerified).toBe(true);
  });

  it("allows re-registration after account deletion", async () => {
    const app = await getApp();
    const email = "reregister@example.com";
    const password = "password123";

    const first = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", `Bearer ${first.body.data.accessToken}`)
      .send({ password });

    const second = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password, firstName: "New" }));

    expect(second.status).toBe(201);
    expect(second.body.data.user.email).toBe(email);
    expect(second.body.data.user.firstName).toBe("New");
  });

  it("logs in with valid credentials", async () => {
    const app = await getApp();
    const email = "login@example.com";
    const password = "password123";

    await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTypeOf("string");
    expect(res.body.data.refreshToken).toBeTypeOf("string");
  });

  it("rotates refresh tokens", async () => {
    const app = await getApp();
    const email = "refresh@example.com";
    const password = "password123";

    const register = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    const oldRefresh = register.body.data.refreshToken;

    const refresh = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefresh });

    expect(refresh.status).toBe(200);
    expect(refresh.body.data.refreshToken).not.toBe(oldRefresh);

    const replay = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefresh });

    expect(replay.status).toBe(401);
  });

  it("changes password for authenticated user", async () => {
    const app = await getApp();
    const email = "changepw@example.com";
    const password = "password123";
    const newPassword = "newpassword456";

    const register = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    const token = register.body.data.accessToken;

    const change = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: password,
        newPassword,
        confirmNewPassword: newPassword,
      });

    expect(change.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: newPassword });
    expect(newLogin.status).toBe(200);
  });

  it("updates social links on profile", async () => {
    const app = await getApp();
    const email = "social@example.com";
    const password = "password123";

    const register = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    const token = register.body.data.accessToken;

    const update = await request(app)
      .patch("/api/v1/users/me/social-links")
      .set("Authorization", `Bearer ${token}`)
      .send({
        instagram: "https://instagram.com/johndoe",
        website: "johndoe.com",
      });

    expect(update.status).toBe(200);
    expect(update.body.data.socialLinks.instagram).toBe(
      "https://instagram.com/johndoe",
    );
    expect(update.body.data.socialLinks.website).toBe("johndoe.com");
  });

  it("updates profile with split phone fields", async () => {
    const app = await getApp();
    const email = "phone@example.com";
    const password = "password123";

    const register = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    const token = register.body.data.accessToken;

    const update = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneCountryCode: "+971",
        phoneNumber: "501234567",
      });

    expect(update.status).toBe(200);
    expect(update.body.data.phoneCountryCode).toBe("+971");
    expect(update.body.data.phoneNumber).toBe("501234567");
  });

  it("clears phone when phoneNumber is sent empty", async () => {
    const app = await getApp();
    const email = "phone-clear@example.com";
    const password = "password123";

    const register = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password }));

    const token = register.body.data.accessToken;

    await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneCountryCode: "+971",
        phoneNumber: "501234567",
      });

    const clear = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ phoneNumber: "" });

    expect(clear.status).toBe(200);
    expect(clear.body.data.phoneCountryCode).toBeUndefined();
    expect(clear.body.data.phoneNumber).toBeUndefined();
    expect(clear.body.data.phone).toBeUndefined();
  });
});
