import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

describe.skipIf(!mongoAvailable)("auth API", () => {
  it("registers a new user and returns tokens", async () => {
    const app = await getApp();
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "buyer@example.com",
      password: "password123",
      firstName: "Test",
      role: "buyer",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTypeOf("string");
    expect(res.body.data.refreshToken).toBeTypeOf("string");
    expect(res.body.data.user.email).toBe("buyer@example.com");
  });

  it("rejects duplicate registration", async () => {
    const app = await getApp();
    const payload = {
      email: "dup@example.com",
      password: "password123",
    };

    await request(app).post("/api/v1/auth/register").send(payload);
    const res = await request(app).post("/api/v1/auth/register").send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("logs in with valid credentials", async () => {
    const app = await getApp();
    const email = "login@example.com";
    const password = "password123";

    await request(app).post("/api/v1/auth/register").send({ email, password });

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
      .send({ email, password });

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
});
