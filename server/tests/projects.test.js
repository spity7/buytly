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

  it("allows publishing compound project with one unit", async () => {
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

    expect(publish.status).toBe(200);
    expect(publish.body.data.status).toBe("pending");
  });

  it("rejects publishing compound project with no units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "compound-empty@example.com");

    const created = await createProject(app, token, {
      kind: "compound",
      title: "Empty Compound",
    });
    const projectId = created.body.data._id;

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

  it("trashes project and units together and lists them in mine trash", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "trash-flow@example.com");

    const created = await createProject(app, token, { kind: "single" });
    const projectId = created.body.data._id;

    await createPropertyForProject(app, token, projectId, { status: "draft" });

    const del = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const activeList = await request(app)
      .get("/api/v1/projects/mine")
      .set("Authorization", `Bearer ${token}`);
    expect(activeList.body.data.some((p) => p._id === projectId)).toBe(false);

    const trashList = await request(app)
      .get("/api/v1/projects/mine?trashed=true")
      .set("Authorization", `Bearer ${token}`);
    expect(trashList.body.data.some((p) => p._id === projectId)).toBe(true);

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    const trashedUnit = await Property.findOne({ projectId });
    expect(trashedUnit.deletedAt).toBeTruthy();
    expect(trashedUnit.status).toBe("archived");

    const restore = await request(app)
      .patch(`/api/v1/projects/${projectId}/restore`)
      .set("Authorization", `Bearer ${token}`);
    expect(restore.status).toBe(200);

    const restoredUnit = await Property.findOne({ projectId });
    expect(restoredUnit.deletedAt).toBeNull();
    expect(restoredUnit.status).toBe("draft");
  });

  it("permanently deletes a trashed project and its units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "perm-del@example.com");

    const created = await createProject(app, token, { kind: "single" });
    const projectId = created.body.data._id;
    await createPropertyForProject(app, token, projectId, { status: "draft" });

    await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    const permanent = await request(app)
      .delete(`/api/v1/projects/${projectId}/permanent`)
      .set("Authorization", `Bearer ${token}`);
    expect(permanent.status).toBe(200);

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    const project = await Project.findById(projectId);
    const units = await Property.find({ projectId });
    expect(project).toBeNull();
    expect(units).toHaveLength(0);
  });

  it("forces villa type for units on single projects", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "single-villa@example.com");

    const created = await createProject(app, token, { kind: "single" });
    const projectId = created.body.data._id;

    const unitRes = await createPropertyForProject(app, token, projectId, {
      type: "apartment",
    });
    expect(unitRes.status).toBe(201);
    expect(unitRes.body.data.type).toBe("villa");
  });

  it("allows changing kind on draft project with no units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "kind-switch@example.com");

    const created = await createProject(app, token, { kind: "compound" });
    const projectId = created.body.data._id;

    const updated = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ kind: "single" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.kind).toBe("single");
  });

  it("rejects kind change when project has units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "kind-with-units@example.com");

    const created = await createProject(app, token, { kind: "compound" });
    const projectId = created.body.data._id;
    await createPropertyForProject(app, token, projectId);

    const updated = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ kind: "single" });

    expect(updated.status).toBe(400);
  });

  it("rejects kind change when project is not draft", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "kind-active@example.com");

    const created = await createProject(app, token, { kind: "compound" });
    const projectId = created.body.data._id;
    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const updated = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ kind: "single" });

    expect(updated.status).toBe(400);
  });

  it("rejects publishing as single when kind and status change together with two units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "kind-publish@example.com");

    const created = await createProject(app, token, {
      kind: "compound",
      title: "Kind Publish Test",
    });
    const projectId = created.body.data._id;

    await createPropertyForProject(app, token, projectId, { title: "Unit A" });
    await createPropertyForProject(app, token, projectId, { title: "Unit B" });

    const publish = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ kind: "single", status: "active" });

    expect(publish.status).toBe(400);
  });

  it("blocks admin from activating unit before parent project is active", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(
      app,
      "unit-before-project@example.com",
    );
    const adminEmail = "unit-before-project-admin@example.com";
    await registerAndGetToken(app, adminEmail);
    await User.findOneAndUpdate({ email: adminEmail }, { role: "admin" });
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: adminEmail,
      password: "password123",
    });
    const adminToken = adminLogin.body.data.accessToken;

    const created = await createProject(app, sellerToken, { kind: "compound" });
    const projectId = created.body.data._id;
    const unitRes = await createPropertyForProject(
      app,
      sellerToken,
      projectId,
      {
        status: "pending",
      },
    );
    const unitId = unitRes.body.data._id;

    const moderate = await request(app)
      .patch(`/api/v1/admin/properties/${unitId}/moderate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "active" });

    expect(moderate.status).toBe(400);
  });

  it("rejects permanent delete when project is not in trash", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "perm-active@example.com");

    const created = await createProject(app, token, { kind: "single" });
    const projectId = created.body.data._id;

    const permanent = await request(app)
      .delete(`/api/v1/projects/${projectId}/permanent`)
      .set("Authorization", `Bearer ${token}`);
    expect(permanent.status).toBe(400);
  });
});
