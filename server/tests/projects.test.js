import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import {
  createProject,
  createPropertyForProject,
  projectPayload,
} from "./helpers/listingFixtures.js";
import { Project } from "../src/modules/projects/project.model.js";
import { User } from "../src/modules/users/user.model.js";

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

describe.skipIf(!mongoAvailable)("projects API", () => {
  it("creates a single project and lists it publicly when active", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "proj-seller@example.com");

    const created = await createProject(app, token, { kind: "single" });
    expect(created.status).toBe(201);

    const projectId = created.body.data._id;
    const unitRes = await createPropertyForProject(app, token, projectId, {
      status: "draft",
    });
    expect(unitRes.status).toBe(201);

    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const list = await request(app).get("/api/v1/projects");
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects publishing compound project with one unit", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "compound@example.com");

    const created = await createProject(app, token, {
      kind: "compound",
      title: "Compound Test",
    });
    const projectId = created.body.data._id;

    await createPropertyForProject(app, token, projectId);

    const publish = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "active" });

    expect(publish.status).toBe(400);
  });

  it("hides draft units on public project slug", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "slug-public@example.com");

    const created = await createProject(app, token, { kind: "single" });
    const projectId = created.body.data._id;

    const unitRes = await createPropertyForProject(app, token, projectId, {
      title: "Draft Unit Hidden",
      status: "draft",
    });
    expect(unitRes.status).toBe(201);

    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const slug = created.body.data.slug;
    const bySlug = await request(app).get(`/api/v1/projects/slug/${slug}`);
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.units).toEqual([]);
  });

  it("approving project publishes pending units", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(
      app,
      "cascade-seller@example.com",
    );
    const adminEmail = "cascade-admin@example.com";
    await registerAndGetToken(app, adminEmail);
    await User.findOneAndUpdate({ email: adminEmail }, { role: "admin" });
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: adminEmail,
      password: "password123",
    });
    const adminToken = adminLogin.body.data.accessToken;

    const created = await createProject(app, sellerToken, { kind: "single" });
    const projectId = created.body.data._id;
    await createPropertyForProject(app, sellerToken, projectId, {
      status: "draft",
    });

    await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ status: "active" });

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    const pendingUnit = await Property.findOne({ projectId });
    expect(pendingUnit.status).toBe("pending");

    await request(app)
      .patch(`/api/v1/admin/projects/${projectId}/moderate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "active" });

    const activeUnit = await Property.findOne({ projectId });
    expect(activeUnit.status).toBe("active");
  });
});
