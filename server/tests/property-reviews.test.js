import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { Property } from "../src/modules/properties/property.model.js";
import { PropertyReview } from "../src/modules/property-reviews/property-review.model.js";

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
  title: "Review Test Apartment",
  description: "A spacious apartment for review integration tests.",
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
  virtualTourUrl: "https://my.matterport.com/show/?m=example",
  floorPlans: [
    {
      title: "First Floor",
      area: 1200,
      areaUnit: "sqft",
      bedrooms: 2,
      bathrooms: 2,
      price: 350000,
    },
  ],
  ...overrides,
});

const registerAndGetToken = async (app, overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send(
      registerPayload({
        email: `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
        ...overrides,
      }),
    );
  expect(res.status).toBe(201);
  return res.body.data.accessToken;
};

const createActiveProperty = async (app, sellerToken, overrides = {}) => {
  const created = await request(app)
    .post("/api/v1/properties")
    .set("Authorization", `Bearer ${sellerToken}`)
    .send(propertyPayload(overrides));

  expect(created.status).toBe(201);

  await Property.findByIdAndUpdate(created.body.data._id, { status: "active" });
  return created.body.data._id;
};

describe.skipIf(!mongoAvailable)("property reviews API", () => {
  it("lists reviews with stats for an active property", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, { role: "seller" });
    const buyerToken = await registerAndGetToken(app, { role: "buyer" });

    const propertyId = await createActiveProperty(app, sellerToken);

    await request(app)
      .post(`/api/v1/properties/${propertyId}/reviews`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        rating: 5,
        title: "Great place",
        text: "Loved the layout and location.",
      })
      .expect(201);

    const res = await request(app)
      .get(`/api/v1/properties/${propertyId}/reviews`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.reviews).toHaveLength(1);
    expect(res.body.data.stats.reviewCount).toBe(1);
    expect(res.body.data.stats.averageRating).toBe(5);
  }, 15000);

  it("prevents duplicate reviews from the same user", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, { role: "seller" });
    const buyerToken = await registerAndGetToken(app, { role: "buyer" });

    const propertyId = await createActiveProperty(app, sellerToken);

    await request(app)
      .post(`/api/v1/properties/${propertyId}/reviews`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        rating: 4,
        title: "Nice",
        text: "Would visit again.",
      })
      .expect(201);

    const duplicate = await request(app)
      .post(`/api/v1/properties/${propertyId}/reviews`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        rating: 3,
        title: "Changed mind",
        text: "Not as good the second time.",
      });

    expect(duplicate.status).toBe(409);
  });

  it("returns hasReviewed for authenticated users", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, { role: "seller" });
    const buyerToken = await registerAndGetToken(app, { role: "buyer" });

    const propertyId = await createActiveProperty(app, sellerToken);

    const before = await request(app)
      .get(`/api/v1/properties/${propertyId}/reviews/check`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .expect(200);

    expect(before.body.data.hasReviewed).toBe(false);

    await request(app)
      .post(`/api/v1/properties/${propertyId}/reviews`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        rating: 5,
        title: "Excellent",
        text: "Five stars all around.",
      })
      .expect(201);

    const after = await request(app)
      .get(`/api/v1/properties/${propertyId}/reviews/check`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .expect(200);

    expect(after.body.data.hasReviewed).toBe(true);

    await PropertyReview.deleteMany({ propertyId });
  });

  it("lists empty reviews for a pending property when requested by owner", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, { role: "seller" });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send(propertyPayload({ title: "Pending Review Property" }))
      .expect(201);

    const propertyId = created.body.data._id;

    const res = await request(app)
      .get(`/api/v1/properties/${propertyId}/reviews`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .expect(200);

    expect(res.body.data.reviews).toEqual([]);
    expect(res.body.data.stats.reviewCount).toBe(0);
  });
});

describe.skipIf(!mongoAvailable)("property extended fields", () => {
  it("persists virtualTourUrl and floorPlans on create/update", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, { role: "seller" });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyPayload({ title: "Extended Fields Property" }))
      .expect(201);

    expect(created.body.data.virtualTourUrl).toBe(
      "https://my.matterport.com/show/?m=example",
    );
    expect(created.body.data.floorPlans).toHaveLength(1);
    expect(created.body.data.floorPlans[0].title).toBe("First Floor");
  });
});
