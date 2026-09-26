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
  it("creates a project and lists it publicly when active", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "proj-seller@example.com");

    const created = await createProject(app, token);
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

  it("allows publishing project with one unit", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "compound@example.com");

    const created = await createProject(app, token, {
      title: "Publish Test Project",
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

  it("rejects publishing project with no units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "compound-empty@example.com");

    const created = await createProject(app, token, {
      title: "Empty Project",
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

    const created = await createProject(app, token);
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

  it("does not increment project view count when owner loads from dashboard", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "proj-owner-view@example.com");

    const created = await createProject(app, token);
    const projectId = created.body.data._id;
    const slug = created.body.data.slug;

    await createPropertyForProject(app, token, projectId, { status: "draft" });
    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const publicView = await request(app).get(`/api/v1/projects/slug/${slug}`);
    expect(publicView.status).toBe(200);
    const afterPublic = publicView.body.data.viewCount;

    const ownerView = await request(app)
      .get(`/api/v1/projects/slug/${slug}`)
      .set("Authorization", `Bearer ${token}`);
    expect(ownerView.status).toBe(200);
    expect(ownerView.body.data.viewCount).toBe(afterPublic);

    const secondPublic = await request(app).get(
      `/api/v1/projects/slug/${slug}`,
    );
    expect(secondPublic.body.data.viewCount).toBe(afterPublic + 1);
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

    const created = await createProject(app, sellerToken);
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

  it("returning project to draft demotes active and pending units", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(
      app,
      "draft-cascade-seller@example.com",
    );
    const adminEmail = "draft-cascade-admin@example.com";
    await registerAndGetToken(app, adminEmail);
    await User.findOneAndUpdate({ email: adminEmail }, { role: "admin" });
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: adminEmail,
      password: "password123",
    });
    const adminToken = adminLogin.body.data.accessToken;

    const created = await createProject(app, sellerToken);
    const projectId = created.body.data._id;
    await createPropertyForProject(app, sellerToken, projectId, {
      status: "draft",
    });

    await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ status: "active" });

    await request(app)
      .patch(`/api/v1/admin/projects/${projectId}/moderate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "active" });

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    let unit = await Property.findOne({ projectId });
    expect(unit.status).toBe("active");

    await request(app)
      .patch(`/api/v1/admin/projects/${projectId}/moderate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "draft" });

    unit = await Property.findOne({ projectId });
    expect(unit.status).toBe("draft");
  });

  it("trashes project and units together and lists them in mine trash", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "trash-flow@example.com");

    const created = await createProject(app, token);
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

  it("blocks restoring a unit while its parent project is in trash", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(
      app,
      "unit-restore-block@example.com",
    );

    const created = await createProject(app, token);
    const projectId = created.body.data._id;

    await createPropertyForProject(app, token, projectId, { status: "draft" });

    await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    const trashedUnit = await Property.findOne({ projectId });
    expect(trashedUnit.deletedAt).toBeTruthy();

    const restoreUnit = await request(app)
      .patch(`/api/v1/properties/${trashedUnit._id}/restore`)
      .set("Authorization", `Bearer ${token}`);

    expect(restoreUnit.status).toBe(400);
    expect(restoreUnit.body.message).toMatch(/parent project/i);

    const mineTrash = await request(app)
      .get("/api/v1/properties/mine?trashed=true")
      .set("Authorization", `Bearer ${token}`);

    expect(mineTrash.status).toBe(200);
    expect(
      mineTrash.body.data.some(
        (p) => String(p._id) === String(trashedUnit._id),
      ),
    ).toBe(false);
  });

  it("permanently deletes a trashed project and its units", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "perm-del@example.com");

    const created = await createProject(app, token);
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

    const created = await createProject(app, sellerToken);
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

  it("admin archive cascades trash to all project units", async () => {
    const app = await getApp();
    const sellerToken = await registerAndGetToken(
      app,
      "admin-archive-cascade@example.com",
    );
    const adminEmail = "admin-archive-cascade-admin@example.com";
    await registerAndGetToken(app, adminEmail);
    await User.findOneAndUpdate({ email: adminEmail }, { role: "admin" });
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: adminEmail,
      password: "password123",
    });
    const adminToken = adminLogin.body.data.accessToken;

    const created = await createProject(app, sellerToken);
    const projectId = created.body.data._id;
    await createPropertyForProject(app, sellerToken, projectId, {
      status: "active",
    });
    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const archive = await request(app)
      .patch(`/api/v1/admin/projects/${projectId}/moderate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "archived" });

    expect(archive.status).toBe(200);

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    const unit = await Property.findOne({ projectId });
    const project = await Project.findById(projectId);
    expect(project.deletedAt).toBeTruthy();
    expect(unit.deletedAt).toBeTruthy();
    expect(unit.status).toBe("archived");
  });

  it("restores units trashed before project when project is restored", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "cascade-restore@example.com");

    const created = await createProject(app, token);
    const projectId = created.body.data._id;
    const unitA = await createPropertyForProject(app, token, projectId, {
      title: "Unit A",
    });
    await createPropertyForProject(app, token, projectId, {
      title: "Unit B",
    });
    const unitAId = unitA.body.data._id;

    await request(app)
      .delete(`/api/v1/properties/${unitAId}`)
      .set("Authorization", `Bearer ${token}`);

    await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    const restore = await request(app)
      .patch(`/api/v1/projects/${projectId}/restore`)
      .set("Authorization", `Bearer ${token}`);
    expect(restore.status).toBe(200);

    const { Property } =
      await import("../src/modules/properties/property.model.js");
    const units = await Property.find({ projectId });
    expect(units).toHaveLength(2);
    for (const unit of units) {
      expect(unit.deletedAt).toBeNull();
      expect(unit.status).toBe("draft");
    }
  });

  it("rejects permanent delete when project is not in trash", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "perm-active@example.com");

    const created = await createProject(app, token);
    const projectId = created.body.data._id;

    const permanent = await request(app)
      .delete(`/api/v1/projects/${projectId}/permanent`)
      .set("Authorization", `Bearer ${token}`);
    expect(permanent.status).toBe(400);
  });

  it("demotes active project to draft when its only unit is trashed", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(
      app,
      "single-unit-trash@example.com",
    );

    const created = await createProject(app, token);
    const projectId = created.body.data._id;

    const unitRes = await createPropertyForProject(app, token, projectId, {
      title: "Only Unit",
      status: "draft",
    });
    const unitId = unitRes.body.data._id;

    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const deleteUnit = await request(app)
      .delete(`/api/v1/properties/${unitId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteUnit.status).toBe(200);

    const project = await Project.findById(projectId);
    expect(project.status).toBe("draft");
    expect(project.deletedAt).toBeNull();
  });

  it("includes trashedUnitCount on owner project detail", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(
      app,
      "trashed-unit-count@example.com",
    );

    const created = await createProject(app, token);
    const projectId = created.body.data._id;

    const unitRes = await createPropertyForProject(app, token, projectId, {
      status: "draft",
    });
    const unitId = unitRes.body.data._id;

    await request(app)
      .delete(`/api/v1/properties/${unitId}`)
      .set("Authorization", `Bearer ${token}`);

    const detail = await request(app)
      .get(`/api/v1/projects/${projectId}?includeUnits=true`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.unitCount).toBe(0);
    expect(detail.body.data.trashedUnitCount).toBe(1);
    expect(detail.body.data.units).toHaveLength(0);
  });

  it("allows restoring a trashed unit when another live unit exists on the project", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "multi-restore@example.com");

    const created = await createProject(app, token);
    const projectId = created.body.data._id;

    const first = await createPropertyForProject(app, token, projectId, {
      title: "Original Unit",
      status: "draft",
    });
    const firstId = first.body.data._id;

    await request(app)
      .delete(`/api/v1/properties/${firstId}`)
      .set("Authorization", `Bearer ${token}`);

    const replacement = await createPropertyForProject(app, token, projectId, {
      title: "Replacement Unit",
      status: "draft",
    });
    expect(replacement.status).toBe(201);

    const restoreUnit = await request(app)
      .patch(`/api/v1/properties/${firstId}/restore`)
      .set("Authorization", `Bearer ${token}`);

    expect(restoreUnit.status).toBe(200);
  });
});
