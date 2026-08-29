import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";

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

const loginAsAdmin = async (app, email = "admin-users@example.com") => {
  await request(app)
    .post("/api/v1/auth/register")
    .send(registerPayload({ email, role: "buyer" }));

  await User.findOneAndUpdate({ email }, { role: "admin" });

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });

  return login.body.data.accessToken;
};

describe.skipIf(!mongoAvailable)("admin users API", () => {
  it("lists deleted users and returns detail with related counts", async () => {
    const app = await getApp();
    const email = "deleted-user-admin@example.com";
    const password = "password123";

    const registered = await request(app)
      .post("/api/v1/auth/register")
      .send(registerPayload({ email, password, role: "seller" }));

    const userId = registered.body.data.user.id;
    const accessToken = registered.body.data.accessToken;

    await Property.create({
      title: "Seller listing",
      slug: "seller-listing-admin-test",
      description: "Stays live after delete",
      type: "apartment",
      listingType: "sale",
      price: 300000,
      location: { city: "Dubai", country: "UAE", coordinates: [55.2708, 25.2048] },
      ownerId: userId,
      status: "active",
    });

    await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ password });

    const adminToken = await loginAsAdmin(app);

    const activeList = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(activeList.status).toBe(200);
    expect(
      activeList.body.data.some((user) => user.id === userId),
    ).toBe(false);

    const deletedList = await request(app)
      .get("/api/v1/admin/users?deleted=true")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deletedList.status).toBe(200);
    const deletedUser = deletedList.body.data.find((user) => user.id === userId);
    expect(deletedUser).toBeTruthy();
    expect(deletedUser.isDeleted).toBe(true);
    expect(deletedUser.deletedEmail).toBe(email);

    const detail = await request(app)
      .get(`/api/v1/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.user.deletedEmail).toBe(email);
    expect(detail.body.data.relatedCounts.properties).toBe(1);
    expect(detail.body.data.relatedCounts.activeListings).toBe(1);
  });
});
