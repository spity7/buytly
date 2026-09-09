import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const loginAsAdmin = async (app, email = "admin-analytics@example.com") => {
  await request(app)
    .post("/api/v1/auth/register")
    .send({
      email,
      password: "password123",
      confirmPassword: "password123",
      firstName: "Admin",
      role: "buyer",
    });

  await User.findOneAndUpdate({ email }, { role: "admin" });

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });

  return login.body.data.accessToken;
};

describe.skipIf(!mongoAvailable)("admin analytics API", () => {
  it("returns platform KPIs for admins", async () => {
    const app = await getApp();
    const adminToken = await loginAsAdmin(app);

    const res = await request(app)
      .get("/api/v1/admin/analytics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.usersByRole)).toBe(true);
    expect(Array.isArray(res.body.data.listingsByType)).toBe(true);
    expect(typeof res.body.data.bookingsThisMonth).toBe("number");
    expect(Array.isArray(res.body.data.transactionVolume)).toBe(true);
    expect(Array.isArray(res.body.data.topCities)).toBe(true);
  });

  it("rejects analytics for non-admin users", async () => {
    const app = await getApp();

    const buyer = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "buyer-analytics@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "buyer",
      });

    const res = await request(app)
      .get("/api/v1/admin/analytics")
      .set("Authorization", `Bearer ${buyer.body.data.accessToken}`);

    expect(res.status).toBe(403);
  });
});
