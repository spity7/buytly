import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Project } from "../src/modules/projects/project.model.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const loginAsAdmin = async (app, email = "catalog-admin@example.com") => {
  await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    role: "buyer",
  });

  await User.findOneAndUpdate({ email }, { role: "admin" });

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });

  return login.body.data.accessToken;
};

describe.skipIf(!mongoAvailable)("catalog API", () => {
  it("bootstraps and lists property types and amenities publicly", async () => {
    const app = await getApp();

    const types = await request(app).get("/api/v1/catalog/property-types");
    expect(types.status).toBe(200);
    expect(types.body.data.length).toBeGreaterThan(0);

    const amenities = await request(app).get("/api/v1/catalog/amenities");
    expect(amenities.status).toBe(200);
    expect(amenities.body.data.length).toBeGreaterThan(0);
  });

  it("allows admin to create and deactivate a property type", async () => {
    const app = await getApp();
    const token = await loginAsAdmin(app, "catalog-admin-types@example.com");

    const created = await request(app)
      .post("/api/v1/admin/catalog/property-types")
      .set("Authorization", `Bearer ${token}`)
      .send({
        value: "penthouse",
        label: "Penthouse",
        sortOrder: 99,
      });

    expect(created.status).toBe(201);
    expect(created.body.data.value).toBe("penthouse");

    const updated = await request(app)
      .patch(`/api/v1/admin/catalog/property-types/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: false });

    expect(updated.status).toBe(200);
    expect(updated.body.data.isActive).toBe(false);
  });

  it("does not change property type slug on update", async () => {
    const app = await getApp();
    const token = await loginAsAdmin(app, "catalog-slug-immutable@example.com");

    const created = await request(app)
      .post("/api/v1/admin/catalog/property-types")
      .set("Authorization", `Bearer ${token}`)
      .send({
        value: "loft",
        label: "Loft",
        sortOrder: 50,
      });

    const updated = await request(app)
      .patch(`/api/v1/admin/catalog/property-types/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ value: "changed-slug", label: "Loft updated" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.value).toBe("loft");
    expect(updated.body.data.label).toBe("Loft updated");
  });

  it("includes listingCount on admin catalog lists", async () => {
    const app = await getApp();
    const token = await loginAsAdmin(app, "catalog-listing-count@example.com");

    const seller = await request(app).post("/api/v1/auth/register").send({
      email: "catalog-count-seller@example.com",
      password: "password123",
      confirmPassword: "password123",
      role: "seller",
    });

    const project = await Project.create({
      title: "Catalog count project",
      slug: "catalog-count-project-test",
      description: "Project for catalog count test",
      kind: "single",
      location: {
        type: "Point",
        city: "Dubai",
        country: "UAE",
        coordinates: [55.2708, 25.2048],
      },
      ownerId: seller.body.data.user.id,
      status: "active",
    });

    await Property.create({
      title: "Catalog count listing",
      slug: "catalog-count-listing-test",
      description: "Uses default apartment type and WiFi amenity",
      type: "apartment",
      projectId: project._id,
      price: 250000,
      amenities: ["WiFi"],
      location: project.location,
      ownerId: seller.body.data.user.id,
      status: "active",
    });

    const types = await request(app)
      .get("/api/v1/admin/catalog/property-types")
      .set("Authorization", `Bearer ${token}`);

    expect(types.status).toBe(200);
    const apartment = types.body.data.find(
      (item) => item.value === "apartment",
    );
    expect(apartment?.listingCount).toBeGreaterThanOrEqual(1);

    const amenities = await request(app)
      .get("/api/v1/admin/catalog/amenities")
      .set("Authorization", `Bearer ${token}`);

    expect(amenities.status).toBe(200);
    const wifi = amenities.body.data.find((item) => item.value === "WiFi");
    expect(wifi?.listingCount).toBeGreaterThanOrEqual(1);
  });

  it("rejects duplicate property type and amenity display names", async () => {
    const app = await getApp();
    const token = await loginAsAdmin(app, "catalog-dup-names@example.com");

    const dupType = await request(app)
      .post("/api/v1/admin/catalog/property-types")
      .set("Authorization", `Bearer ${token}`)
      .send({
        value: "apartment",
        label: "Apartment",
        sortOrder: 1,
      });

    expect(dupType.status).toBe(409);

    const dupTypeLabel = await request(app)
      .post("/api/v1/admin/catalog/property-types")
      .set("Authorization", `Bearer ${token}`)
      .send({
        value: "another-apartment",
        label: " apartment ",
        sortOrder: 2,
      });

    expect(dupTypeLabel.status).toBe(409);

    const dupAmenity = await request(app)
      .post("/api/v1/admin/catalog/amenities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        value: "WiFi",
        label: "wifi",
        sortOrder: 1,
      });

    expect(dupAmenity.status).toBe(409);

    const created = await request(app)
      .post("/api/v1/admin/catalog/amenities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        value: "Rooftop Deck",
        label: "Rooftop Deck",
        sortOrder: 99,
      });

    expect(created.status).toBe(201);

    const dupAmenityUpdate = await request(app)
      .patch(`/api/v1/admin/catalog/amenities/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ label: "WiFi" });

    expect(dupAmenityUpdate.status).toBe(409);
  });
});
