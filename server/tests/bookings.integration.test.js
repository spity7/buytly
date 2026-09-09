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
      firstName: "Test",
      role: "buyer",
      ...overrides,
    });
  return res.body.data.accessToken;
};

const createActiveProperty = async (app, sellerToken) => {
  const created = await request(app)
    .post("/api/v1/properties")
    .set("Authorization", `Bearer ${sellerToken}`)
    .send({
      title: "Booking Cancel Test Listing",
      description: "Listing used in booking cancel integration test.",
      type: "apartment",
      listingType: "sale",
      price: 300000,
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
  return propertyId;
};

describe.skipIf(!mongoAvailable)("bookings API", () => {
  it("lets a buyer cancel a pending booking", async () => {
    const app = await getApp();
    const sellerToken = await register(app, {
      email: "seller-cancel@example.com",
      role: "seller",
    });
    const buyerToken = await register(app, {
      email: "buyer-cancel@example.com",
      role: "buyer",
    });

    const propertyId = await createActiveProperty(app, sellerToken);

    const bookingRes = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        propertyId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        message: "Please confirm visit",
      });

    expect(bookingRes.status).toBe(201);
    const bookingId = bookingRes.body.data._id;

    const cancelRes = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe("cancelled");
  });
});
