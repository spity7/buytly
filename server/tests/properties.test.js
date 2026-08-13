import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { Property } from "../src/modules/properties/property.model.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerPayload = (overrides = {}) => ({
  email: "seller@example.com",
  password: "password123",
  confirmPassword: "password123",
  firstName: "Test",
  role: "seller",
  ...overrides,
});

const propertyPayload = (overrides = {}) => ({
  title: "Modern Downtown Apartment",
  description:
    "A spacious apartment in the heart of downtown with great views.",
  type: "apartment",
  listingType: "sale",
  price: 350000,
  currency: "USD",
  location: {
    coordinates: [55.2708, 25.2048],
    address: "123 Main St",
    city: "Dubai",
    country: "UAE",
  },
  bedrooms: 2,
  bathrooms: 2,
  area: 120,
  status: "active",
  ...overrides,
});

const registerAndGetToken = async (app, overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send(registerPayload(overrides));
  return res.body.data.accessToken;
};

const createActiveProperty = async (app, sellerToken, overrides = {}) => {
  const created = await request(app)
    .post("/api/v1/properties")
    .set("Authorization", `Bearer ${sellerToken}`)
    .send(propertyPayload(overrides));

  await Property.findByIdAndUpdate(created.body.data._id, { status: "active" });
  return created.body.data._id;
};

describe.skipIf(!mongoAvailable)("properties API", () => {
  it("lists active properties publicly", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "list-seller@example.com",
    });

    await createActiveProperty(app, token, { title: "Listed Property One" });

    const res = await request(app).get("/api/v1/properties");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it("creates a property for seller and downgrades active to pending", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "create-seller@example.com",
    });

    const res = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Modern Downtown Apartment");
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.slug).toBeTypeOf("string");
    expect(res.body.data.ownerId).toBeDefined();
  });

  it("gets active property by id publicly", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "get-seller@example.com",
    });

    const id = await createActiveProperty(app, token, {
      title: "Get By Id Property",
    });

    const res = await request(app).get(`/api/v1/properties/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
    expect(res.body.data.viewCount).toBeGreaterThanOrEqual(1);
  });

  it("hides non-active property from public but allows owner access", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "draft-seller@example.com",
    });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyPayload({ title: "Draft Property", status: "draft" }));

    const id = created.body.data._id;

    const publicRes = await request(app).get(`/api/v1/properties/${id}`);
    expect(publicRes.status).toBe(404);

    const ownerRes = await request(app)
      .get(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.data.status).toBe("draft");
  });

  it("allows assigned agent to delete a property", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, {
      email: "owner-delete@example.com",
      role: "seller",
    });
    const agentToken = await registerAndGetToken(app, {
      email: "agent-delete@example.com",
      role: "agent",
    });

    const agentUser = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${agentToken}`);

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send(
        propertyPayload({
          title: "Agent Managed Property",
          agentId: agentUser.body.data.id,
        }),
      );

    const deleteRes = await request(app)
      .delete(`/api/v1/properties/${created.body.data._id}`)
      .set("Authorization", `Bearer ${agentToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it("returns mine listings for authenticated seller", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "mine-seller@example.com",
    });

    await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyPayload({ title: "My Property One", status: "draft" }));

    await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyPayload({ title: "My Property Two", status: "active" }));

    const res = await request(app)
      .get("/api/v1/properties/mine")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it("rejects mine listings without auth", async () => {
    const app = await getApp();
    const res = await request(app).get("/api/v1/properties/mine");

    expect(res.status).toBe(401);
  });

  it("rejects property creation for buyer role", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "buyer-prop@example.com",
      role: "buyer",
    });

    const res = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyPayload());

    expect(res.status).toBe(403);
  });
});

describe.skipIf(!mongoAvailable)("bookings API", () => {
  it("lets seller approve booking when assigned as listing contact", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, {
      email: "seller-booking@example.com",
      role: "seller",
    });
    const buyerToken = await registerAndGetToken(app, {
      email: "buyer-booking@example.com",
      role: "buyer",
    });

    const propertyId = await createActiveProperty(app, sellerToken, {
      title: "Seller Managed Listing",
    });

    const bookingRes = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        propertyId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        message: "Can I visit tomorrow?",
      });

    expect(bookingRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/v1/bookings/agent")
      .set("Authorization", `Bearer ${sellerToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);

    const approveRes = await request(app)
      .patch(`/api/v1/bookings/${bookingRes.body.data._id}/status`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ status: "approved" });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("approved");
  });
});
