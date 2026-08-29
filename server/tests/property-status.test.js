import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { Property } from "../src/modules/properties/property.model.js";
import { User } from "../src/modules/users/user.model.js";

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
    .send(propertyPayload({ ...overrides, status: "active" }));

  await Property.findByIdAndUpdate(created.body.data._id, { status: "active" });
  return created.body.data._id;
};

describe.skipIf(!mongoAvailable)("property status rules", () => {
  it("rejects public list with draft status filter", async () => {
    const app = await getApp();
    const res = await request(app).get("/api/v1/properties?status=draft");
    expect(res.status).toBe(400);
  });

  it("rejects public list with pending status filter", async () => {
    const app = await getApp();
    const res = await request(app).get("/api/v1/properties?status=pending");
    expect(res.status).toBe(400);
  });

  it("allows public list with sold status filter", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "sold-list-seller@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Sold List Property",
    });
    await Property.findByIdAndUpdate(id, { status: "sold" });

    const res = await request(app).get("/api/v1/properties?status=sold");
    expect(res.status).toBe(200);
    expect(res.body.data.some((p) => p._id === id)).toBe(true);
  });

  it("rejects seller setting sold status directly", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "sold-bypass@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Bypass Sold Property",
    });

    const res = await request(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "sold" });

    expect(res.status).toBe(403);
  });

  it("keeps status unchanged when seller updates without status field", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "no-status-update@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Active No Status Change",
    });

    const res = await request(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currency: "USD" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("active");
    expect(res.body.data.currency).toBe("USD");
  });

  it("re-submits for review when seller sends active on update", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "resubmit-review@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Resubmit Review Property",
    });

    const res = await request(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("pending");
  });

  it("rejects favorites for non-active properties", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, {
      email: "fav-seller@example.com",
    });
    const buyerToken = await registerAndGetToken(app, {
      email: "fav-buyer@example.com",
      role: "buyer",
    });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send(
        propertyPayload({ title: "Draft Favorite Property", status: "draft" }),
      );

    const res = await request(app)
      .post("/api/v1/favorites")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ propertyId: created.body.data._id });

    expect(res.status).toBe(404);
  });

  it("admin can moderate pending listing to active", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, {
      email: "mod-seller@example.com",
    });

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send(propertyPayload({ title: "Moderate Me", status: "active" }));

    expect(created.body.data.status).toBe("pending");

    const adminRegister = await request(app)
      .post("/api/v1/auth/register")
      .send(
        registerPayload({
          email: "mod-admin@example.com",
          role: "seller",
        }),
      );

    await User.findByIdAndUpdate(adminRegister.body.data.user.id, {
      role: "admin",
    });

    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "mod-admin@example.com", password: "password123" });

    const res = await request(app)
      .patch(`/api/v1/admin/properties/${created.body.data._id}/moderate`)
      .set("Authorization", `Bearer ${adminLogin.body.data.accessToken}`)
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("active");
  });

  it("marks property sold when transaction completes", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(app, {
      email: "txn-seller@example.com",
    });
    const buyerToken = await registerAndGetToken(app, {
      email: "txn-buyer@example.com",
      role: "buyer",
    });

    const propertyId = await createActiveProperty(app, sellerToken, {
      title: "Transaction Sold Property",
    });

    const txn = await request(app)
      .post("/api/v1/transactions")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        propertyId,
        type: "buy",
        amount: 350000,
      });

    expect(txn.status).toBe(201);

    const complete = await request(app)
      .patch(`/api/v1/transactions/${txn.body.data._id}/status`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ status: "completed" });

    expect(complete.status).toBe(200);

    const property = await Property.findById(propertyId);
    expect(property.status).toBe("sold");
  });

  it("soft-deletes property and hides from mine list", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "soft-delete@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Soft Delete Property",
    });

    const deleteRes = await request(app)
      .delete(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);

    const property = await Property.findById(id);
    expect(property.status).toBe("archived");
    expect(property.deletedAt).toBeTruthy();

    const mineRes = await request(app)
      .get("/api/v1/properties/mine")
      .set("Authorization", `Bearer ${token}`);

    expect(mineRes.body.data.some((p) => p._id === id)).toBe(false);

    const trashRes = await request(app)
      .get("/api/v1/properties/mine?trashed=true")
      .set("Authorization", `Bearer ${token}`);

    expect(trashRes.body.data.some((p) => p._id === id)).toBe(true);
  });

  it("restores soft-deleted property to draft", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "restore-seller@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Restore Property",
    });

    await request(app)
      .delete(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`);

    const restoreRes = await request(app)
      .patch(`/api/v1/properties/${id}/restore`)
      .set("Authorization", `Bearer ${token}`);

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.status).toBe("draft");
    expect(restoreRes.body.data.deletedAt).toBeNull();
  });

  it("re-pends active listing when material fields change without status", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, {
      email: "material-change@example.com",
    });
    const id = await createActiveProperty(app, token, {
      title: "Material Change Property",
    });

    const res = await request(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 999999 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("pending");
  });
});
