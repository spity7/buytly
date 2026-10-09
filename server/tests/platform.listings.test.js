import { describe, it, expect, beforeAll } from "vitest";
import { api } from "./helpers/http.js";
import { mongoAvailable } from "./setup.js";
import { ensureTestSites } from "./helpers/siteFixtures.js";
import { SITE_SLUG } from "../src/modules/sites/site.constants.js";
import { projectPayload } from "./helpers/listingFixtures.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerOnSite = async (app, slug, email, role = "seller") => {
  const res = await api(app, slug).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    firstName: "Partner",
    role,
  });
  return res.body.data.accessToken;
};

const loginAsBuytlyAdmin = async (app, email) => {
  const buytlySite = await Site.findOne({ slug: SITE_SLUG.BUYTLY }).lean();
  await registerOnSite(app, SITE_SLUG.BUYTLY, email, "buyer");
  await User.findOneAndUpdate(
    { email, siteId: buytlySite._id },
    { role: "admin" },
  );
  const login = await api(app, SITE_SLUG.BUYTLY)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });
  return login.body.data.accessToken;
};

async function seedBuildwiseListing(email, { projectTitle, unitTitle }) {
  const site = await Site.findOne({ slug: SITE_SLUG.BUILDWISE }).lean();
  const owner = await User.findOne({ email, siteId: site._id }).lean();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base = projectPayload({ title: projectTitle });

  const project = await Project.create({
    siteId: site._id,
    ownerId: owner._id,
    title: projectTitle,
    slug: `bw-${suffix}`,
    description: base.description,
    location: base.location,
    status: "draft",
  });

  const property = await Property.create({
    siteId: site._id,
    ownerId: owner._id,
    projectId: project._id,
    title: unitTitle,
    slug: `bw-unit-${suffix}`,
    description: "Platform visibility test unit.",
    type: "villa",
    price: 100000,
    location: base.location,
    status: "draft",
  });

  return { projectId: project._id, propertyId: property._id };
}

describe.skipIf(!mongoAvailable)("platform partner listings", () => {
  beforeAll(async () => {
    await ensureTestSites();
  });

  it("returns opted-in buildwise units on buytly platform feed", async () => {
    const app = await getApp();
    const email = `bw-platform-${Date.now()}@example.com`;
    await registerOnSite(app, SITE_SLUG.BUILDWISE, email);
    const { projectId, propertyId } = await seedBuildwiseListing(email, {
      projectTitle: "Platform Test Project",
      unitTitle: "Platform Test Unit",
    });

    await Project.findByIdAndUpdate(projectId, {
      status: "active",
      visibleOnPlatform: true,
    });
    await Property.findByIdAndUpdate(propertyId, {
      status: "active",
      visibleOnPlatform: true,
    });

    const res = await api(app, SITE_SLUG.BUYTLY).get(
      "/api/v1/platform/featured-listings?limit=50",
    );

    expect(res.status).toBe(200);
    const ids = res.body.data.map((row) => String(row._id || row.id));
    expect(ids).toContain(String(propertyId));
    const match = res.body.data.find(
      (row) => String(row._id || row.id) === String(propertyId),
    );
    expect(match?.sourceSite?.slug).toBe(SITE_SLUG.BUILDWISE);
    expect(match?.sourceSite?.listingUrl).toMatch(
      /^http:\/\/localhost:3001\/single-v1\//,
    );
  });

  it("excludes buildwise units when visibleOnPlatform is false", async () => {
    const app = await getApp();
    const email = `bw-hidden-${Date.now()}@example.com`;
    await registerOnSite(app, SITE_SLUG.BUILDWISE, email);
    const { projectId, propertyId } = await seedBuildwiseListing(email, {
      projectTitle: "Hidden Platform Project",
      unitTitle: "Hidden Platform Unit",
    });

    await Project.findByIdAndUpdate(projectId, { status: "active" });
    await Property.findByIdAndUpdate(propertyId, { status: "active" });

    const res = await api(app, SITE_SLUG.BUYTLY).get(
      "/api/v1/platform/featured-listings?limit=50",
    );

    const ids = res.body.data.map((row) => String(row._id || row.id));
    expect(ids).not.toContain(String(propertyId));
  });

  it("includes sold opted-in units", async () => {
    const app = await getApp();
    const email = `bw-sold-${Date.now()}@example.com`;
    await registerOnSite(app, SITE_SLUG.BUILDWISE, email);
    const { projectId, propertyId } = await seedBuildwiseListing(email, {
      projectTitle: "Sold Platform Project",
      unitTitle: "Sold Platform Unit",
    });

    await Project.findByIdAndUpdate(projectId, {
      status: "sold",
      visibleOnPlatform: true,
    });
    await Property.findByIdAndUpdate(propertyId, {
      status: "sold",
      visibleOnPlatform: true,
    });

    const res = await api(app, SITE_SLUG.BUYTLY).get(
      "/api/v1/platform/featured-listings?limit=50",
    );

    const ids = res.body.data.map((row) => String(row._id || row.id));
    expect(ids).toContain(String(propertyId));
  });

  it("rejects seller PATCH with visibleOnPlatform on tenant site", async () => {
    const app = await getApp();
    const email = `bw-patch-vis-${Date.now()}@example.com`;
    const token = await registerOnSite(app, SITE_SLUG.BUILDWISE, email);
    const { projectId, propertyId } = await seedBuildwiseListing(email, {
      projectTitle: "Patch Visibility Project",
      unitTitle: "Patch Visibility Unit",
    });

    await Project.findByIdAndUpdate(projectId, { status: "active" });
    await Property.findByIdAndUpdate(propertyId, { status: "active" });

    const res = await api(app, SITE_SLUG.BUILDWISE)
      .patch(`/api/v1/properties/${propertyId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ visibleOnPlatform: true });

    expect(res.status).toBe(403);
  });

  it("features partner listing via buytly admin platform-featured endpoint", async () => {
    const app = await getApp();
    const sellerEmail = `bw-admin-feat-${Date.now()}@example.com`;
    await registerOnSite(app, SITE_SLUG.BUILDWISE, sellerEmail);
    const { projectId, propertyId } = await seedBuildwiseListing(sellerEmail, {
      projectTitle: "Admin Feature Project",
      unitTitle: "Admin Feature Unit",
    });

    await Project.findByIdAndUpdate(projectId, { status: "active" });
    await Property.findByIdAndUpdate(propertyId, { status: "active" });

    const adminToken = await loginAsBuytlyAdmin(
      app,
      `buytly-admin-${Date.now()}@example.com`,
    );

    await api(app, SITE_SLUG.BUYTLY)
      .patch(`/api/v1/admin/projects/${projectId}/platform-featured`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ visibleOnPlatform: true })
      .expect(200);

    await api(app, SITE_SLUG.BUYTLY)
      .patch(`/api/v1/admin/properties/${propertyId}/platform-featured`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ visibleOnPlatform: true })
      .expect(200);

    const res = await api(app, SITE_SLUG.BUYTLY).get(
      "/api/v1/platform/featured-listings?limit=50",
    );

    const ids = res.body.data.map((row) => String(row._id || row.id));
    expect(ids).toContain(String(propertyId));
  });

  it("includes buytly first-party units without partner opt-in", async () => {
    const app = await getApp();
    const email = `buytly-own-${Date.now()}@example.com`;
    const token = await registerOnSite(app, SITE_SLUG.BUYTLY, email);
    const projectRes = await api(app, SITE_SLUG.BUYTLY)
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(projectPayload({ title: "Buytly Native Project" }));
    const projectId = projectRes.body.data._id;

    await Project.findByIdAndUpdate(projectId, { status: "active" });

    const property = await Property.create({
      siteId: (await Site.findOne({ slug: SITE_SLUG.BUYTLY }).lean())._id,
      ownerId: (
        await User.findOne({
          email,
          siteId: (await Site.findOne({ slug: SITE_SLUG.BUYTLY }).lean())._id,
        }).lean()
      )._id,
      projectId,
      title: "Buytly Native Unit",
      slug: `buytly-unit-${Date.now()}`,
      description: "First-party platform listing.",
      type: "villa",
      price: 250000,
      location: projectPayload().location,
      status: "active",
    });

    const res = await api(app, SITE_SLUG.BUYTLY).get(
      "/api/v1/platform/featured-listings?limit=50",
    );

    const ids = res.body.data.map((row) => String(row._id || row.id));
    expect(ids).toContain(String(property._id));
  });

  it("returns opted-in buildwise projects on platform featured-projects", async () => {
    const app = await getApp();
    const token = await registerOnSite(
      app,
      SITE_SLUG.BUILDWISE,
      `bw-proj-${Date.now()}@example.com`,
    );

    const projectRes = await api(app, SITE_SLUG.BUILDWISE)
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${token}`)
      .send(projectPayload({ title: "Featured Partner Project" }));
    const projectId = projectRes.body.data._id;

    await Project.findByIdAndUpdate(projectId, {
      status: "active",
      visibleOnPlatform: true,
    });

    const res = await api(app, SITE_SLUG.BUYTLY).get(
      "/api/v1/platform/featured-projects?limit=50",
    );

    expect(res.status).toBe(200);
    const ids = res.body.data.map((row) => String(row._id || row.id));
    expect(ids).toContain(String(projectId));
  });
});
