import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { Property } from "../src/modules/properties/property.model.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const register = async (app, overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({
      email: "buyer@example.com",
      password: "password123",
      confirmPassword: "password123",
      firstName: "Buyer",
      role: "buyer",
      ...overrides,
    });
  return res.body.data.accessToken;
};

describe.skipIf(!mongoAvailable)("favorites API", () => {
  it("adds, lists, checks, and removes favorites for active listings", async () => {
    const app = await getApp();

    const sellerToken = await register(app, {
      email: "seller-fav@example.com",
      role: "seller",
    });
    const buyerToken = await register(app, {
      email: "buyer-fav@example.com",
      role: "buyer",
    });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        title: "Favorite Test Listing",
        description: "Listing used in favorites integration test.",
        type: "apartment",
        listingType: "sale",
        price: 250000,
        location: {
          coordinates: [55.2708, 25.2048],
          address: "123 Main St",
          city: "Dubai",
          country: "UAE",
        },
        bedrooms: 2,
        bathrooms: 2,
        area: 100,
      });

    const propertyId = created.body.data._id;
    await Property.findByIdAndUpdate(propertyId, { status: "active" });

    const addRes = await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ propertyId });

    expect(addRes.status).toBe(201);

    const checkRes = await request(app)
      .get(`/api/v1/favorites/check/${propertyId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(checkRes.status).toBe(200);
    expect(checkRes.body.data.isFavorite).toBe(true);

    const listRes = await request(app)
      .get("/api/v1/favorites")
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);

    const removeRes = await request(app)
      .delete(`/api/v1/favorites/${propertyId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(removeRes.status).toBe(200);

    const checkAfterRemove = await request(app)
      .get(`/api/v1/favorites/check/${propertyId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(checkAfterRemove.body.data.isFavorite).toBe(false);
  });
});
