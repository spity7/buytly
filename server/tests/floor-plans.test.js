import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import {
  createProject,
  createPropertyForProject,
  propertyPayload,
} from "./helpers/listingFixtures.js";
import { Property } from "../src/modules/properties/property.model.js";
import {
  resolveFloorPlansForPropertyType,
  sanitizeFloorPlansForStorage,
} from "../src/modules/properties/floor-plans.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerAndGetToken = async (app, email) => {
  const res = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    firstName: "Test",
    role: "seller",
  });
  return res.body.data.accessToken;
};

const sampleFloorPlan = { title: "Ground Floor" };

describe("floor-plans rules", () => {
  it("sanitizeFloorPlansForStorage keeps only title and gcsKey", () => {
    const rows = sanitizeFloorPlansForStorage([
      {
        title: "Ground",
        price: 999999,
        area: 100,
        bedrooms: 3,
        bathrooms: 2,
        gcsKey: "properties/floor-plans/x.jpg",
      },
    ]);
    expect(rows[0]).toEqual({
      title: "Ground",
      gcsKey: "properties/floor-plans/x.jpg",
    });
  });

  it("resolveFloorPlansForPropertyType accepts plans for any property type", () => {
    expect(
      resolveFloorPlansForPropertyType("apartment", [sampleFloorPlan]),
    ).toHaveLength(1);
    expect(resolveFloorPlansForPropertyType("apartment", [])).toEqual([]);
    expect(
      resolveFloorPlansForPropertyType("office", [sampleFloorPlan]),
    ).toHaveLength(1);
  });
});

describe.skipIf(!mongoAvailable)("floor-plans API", () => {
  it("persists floorPlans on apartment listings", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "fp-apartment@example.com");

    const projectRes = await createProject(app, token);
    const body = propertyPayload(projectRes.body.data._id, {
      type: "apartment",
      floorPlans: [sampleFloorPlan],
    });

    const res = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.data.floorPlans).toHaveLength(1);
    expect(res.body.data.floorPlans[0].title).toBe("Ground Floor");
  });

  it("rejects unknown floor plan fields", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "fp-strict@example.com");

    const projectRes = await createProject(app, token);
    const body = propertyPayload(projectRes.body.data._id, {
      type: "duplex",
      floorPlans: [{ title: "Level 1", area: 120, bedrooms: 2 }],
    });

    const res = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(400);
  });

  it("persists floorPlans for duplex", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "fp-duplex@example.com");

    const projectRes = await createProject(app, token);
    const res = await createPropertyForProject(
      app,
      token,
      projectRes.body.data._id,
      {
        type: "duplex",
        floorPlans: [sampleFloorPlan],
      },
    );

    expect(res.status).toBe(201);
    expect(res.body.data.floorPlans).toHaveLength(1);
    expect(res.body.data.floorPlans[0].title).toBe("Ground Floor");
  });

  it("keeps floor plans when property type changes", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "fp-type-change@example.com");

    const projectRes = await createProject(app, token);
    const projectId = projectRes.body.data._id;

    const created = await createPropertyForProject(app, token, projectId, {
      type: "villa",
      floorPlans: [sampleFloorPlan],
    });
    expect(created.status).toBe(201);
    const id = created.body.data._id;

    const updated = await request(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "apartment" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.floorPlans).toHaveLength(1);
    expect(updated.body.data.floorPlans[0].title).toBe("Ground Floor");

    const stored = await Property.findById(id);
    expect(stored.floorPlans).toHaveLength(1);
    expect(stored.type).toBe("apartment");
  });
});
