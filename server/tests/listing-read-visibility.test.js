import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import { api } from "./helpers/http.js";
import { mongoAvailable } from "./setup.js";
import { ensureTestPropertyTypes } from "./helpers/catalogFixtures.js";
import { projectPayload, propertyPayload } from "./helpers/listingFixtures.js";
import { SITE_SLUG } from "../src/modules/sites/site.constants.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import { nearbyService } from "../src/services/nearby.service.js";
import { PRICE_ON_REQUEST_LABEL } from "../src/shared/priceVisibility.js";

const { BLOCK57, BUYTLY } = SITE_SLUG;
const PRICE = 424242;

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

async function registerOn(app, slug, email, role) {
  const res = await api(app, slug).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    firstName: "Viewer",
    role,
  });
  expect(res.status, res.body?.message).toBe(201);
  const site = await Site.findOne({ slug }).lean();
  const user = await User.findOne({ email, siteId: site._id }).lean();
  return { token: res.body.data.accessToken, userId: String(user._id) };
}

/**
 * Owner plus three logged-in users who do not manage the listing: a buyer,
 * another seller and an agent who is not assigned to it.
 */
async function registerCast(app, slug) {
  const prefix = `${slug}-read`;
  return {
    owner: await registerOn(app, slug, `${prefix}-owner@example.com`, "seller"),
    buyer: await registerOn(app, slug, `${prefix}-buyer@example.com`, "buyer"),
    otherSeller: await registerOn(
      app,
      slug,
      `${prefix}-other-seller@example.com`,
      "seller",
    ),
    otherAgent: await registerOn(
      app,
      slug,
      `${prefix}-other-agent@example.com`,
      "agent",
    ),
  };
}

const nonManagers = (cast) => [
  ["buyer", cast.buyer],
  ["other seller", cast.otherSeller],
  ["unassigned agent", cast.otherAgent],
];

/** Project + one unit created through the API; statuses then set directly. */
async function seedListing(
  app,
  slug,
  token,
  { projectStatus = "active", unitStatus = "active", title = "Unit 1" } = {},
) {
  const projectRes = await api(app, slug)
    .post("/api/v1/projects")
    .set(bearer(token))
    .send(projectPayload({ title: `${title} Project` }));
  expect(projectRes.status, projectRes.body?.message).toBe(201);
  const projectId = projectRes.body.data._id;

  const unitRes = await api(app, slug)
    .post("/api/v1/properties")
    .set(bearer(token))
    .send(propertyPayload(projectId, { title, price: PRICE }));
  expect(unitRes.status, unitRes.body?.message).toBe(201);
  const unitId = unitRes.body.data._id;

  await Property.findByIdAndUpdate(unitId, { status: unitStatus });
  await Project.findByIdAndUpdate(projectId, { status: projectStatus });
  return { projectId, unitId, projectSlug: projectRes.body.data.slug };
}

/** Every public detail read for one listing, as `viewer` (or anonymous). */
async function readAll(app, slug, { projectId, unitId, projectSlug }, viewer) {
  const client = api(app, slug);
  const get = (path) => {
    const req = client.get(path);
    return viewer ? req.set(bearer(viewer.token)) : req;
  };
  return {
    bySlug: await get(`/api/v1/projects/slug/${projectSlug}`),
    byId: await get(`/api/v1/projects/${projectId}?includeUnits=true`),
    units: await get(`/api/v1/projects/${projectId}/properties`),
    property: await get(`/api/v1/properties/${unitId}`),
    nearby: await get(`/api/v1/properties/${unitId}/nearby`),
  };
}

const statusesOf = (reads) =>
  Object.fromEntries(
    Object.entries(reads).map(([name, res]) => [name, res.status]),
  );

const allStatuses = (status) => ({
  bySlug: status,
  byId: status,
  units: status,
  property: status,
  nearby: status,
});

const expectUnitPrice = (unit, hidden) => {
  expect(unit).toBeDefined();
  if (hidden) {
    expect(unit.price).toBeNull();
    expect(unit.priceLabel).toBe(PRICE_ON_REQUEST_LABEL);
  } else {
    expect(unit.price).toBe(PRICE);
    expect(unit).not.toHaveProperty("priceLabel");
  }
};

const expectProjectPrice = (project, hidden) => {
  if (hidden) {
    expect(project.priceMin).toBeNull();
    expect(project.priceMax).toBeNull();
    expect(project.priceLabel).toBe(PRICE_ON_REQUEST_LABEL);
  } else {
    expect(project.priceMin).toBe(PRICE);
    expect(project.priceMax).toBe(PRICE);
    expect(project).not.toHaveProperty("priceLabel");
  }
};

describe.skipIf(!mongoAvailable)("listing detail reads by logged-in users", () => {
  beforeEach(async () => {
    const block57 = await Site.findOne({ slug: BLOCK57 }).lean();
    await ensureTestPropertyTypes(block57._id);
    vi.spyOn(nearbyService, "fetchNearbyPlaces").mockResolvedValue({
      categories: [],
      source: "test",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.each([
    [BUYTLY, false],
    [BLOCK57, true],
  ])("on %s", (slug, hidesPrices) => {
    it("returns 200 for active listings to users who do not manage them", async () => {
      const app = await getApp();
      const cast = await registerCast(app, slug);
      const listing = await seedListing(app, slug, cast.owner.token);

      for (const [label, viewer] of nonManagers(cast)) {
        const reads = await readAll(app, slug, listing, viewer);
        expect(statusesOf(reads), label).toEqual(allStatuses(200));

        expect(reads.bySlug.body.data._id).toBe(listing.projectId);
        expectProjectPrice(reads.bySlug.body.data, hidesPrices);
        expect(reads.bySlug.body.data.units).toHaveLength(1);
        expectUnitPrice(reads.bySlug.body.data.units[0], hidesPrices);

        expectProjectPrice(reads.byId.body.data, hidesPrices);
        expectUnitPrice(reads.byId.body.data.units[0], hidesPrices);

        expect(reads.units.body.data.map((u) => u._id)).toEqual([
          listing.unitId,
        ]);
        expectUnitPrice(reads.units.body.data[0], hidesPrices);

        expect(reads.property.body.data._id).toBe(listing.unitId);
        expectUnitPrice(reads.property.body.data, hidesPrices);

        if (hidesPrices) {
          for (const res of Object.values(reads)) {
            expect(JSON.stringify(res.body)).not.toContain(String(PRICE));
          }
        }
      }
    });

    it("counts views from non-managers but not from the owner", async () => {
      const app = await getApp();
      const cast = await registerCast(app, slug);
      const listing = await seedListing(app, slug, cast.owner.token);
      const client = api(app, slug);

      await client
        .get(`/api/v1/properties/${listing.unitId}`)
        .set(bearer(cast.buyer.token))
        .expect(200);
      await client
        .get(`/api/v1/projects/${listing.projectId}`)
        .set(bearer(cast.buyer.token))
        .expect(200);
      expect((await Property.findById(listing.unitId)).viewCount).toBe(1);
      expect((await Project.findById(listing.projectId)).viewCount).toBe(1);

      const ownerUnit = await client
        .get(`/api/v1/properties/${listing.unitId}`)
        .set(bearer(cast.owner.token))
        .expect(200);
      const ownerProject = await client
        .get(`/api/v1/projects/${listing.projectId}`)
        .set(bearer(cast.owner.token))
        .expect(200);
      expect(ownerUnit.body.data.viewCount).toBe(1);
      expect(ownerProject.body.data.viewCount).toBe(1);
      // Managers keep real prices on a hidden-price site.
      expect(ownerUnit.body.data.price).toBe(PRICE);
      expect(ownerProject.body.data.priceMin).toBe(PRICE);
      expect((await Property.findById(listing.unitId)).viewCount).toBe(1);
      expect((await Project.findById(listing.projectId)).viewCount).toBe(1);
    });

    it.each([["draft"], ["pending"], ["archived"]])(
      "returns 404 to non-managers for a %s project and unit",
      async (status) => {
        const app = await getApp();
        const cast = await registerCast(app, slug);
        const listing = await seedListing(app, slug, cast.owner.token, {
          projectStatus: status,
          unitStatus: status,
        });

        for (const [label, viewer] of [
          ["anonymous", null],
          ...nonManagers(cast),
        ]) {
          const reads = await readAll(app, slug, listing, viewer);
          expect(statusesOf(reads), label).toEqual(allStatuses(404));
        }

        const ownerReads = await readAll(app, slug, listing, cast.owner);
        expect(statusesOf(ownerReads)).toEqual(allStatuses(200));
        expect(ownerReads.byId.body.data.status).toBe(status);
        expect(ownerReads.property.body.data.status).toBe(status);
      },
    );

    it("hides draft units of an active project and units of a non-public project", async () => {
      const app = await getApp();
      const cast = await registerCast(app, slug);
      const listing = await seedListing(app, slug, cast.owner.token);
      const draftUnit = await api(app, slug)
        .post("/api/v1/properties")
        .set(bearer(cast.owner.token))
        .send(propertyPayload(listing.projectId, { title: "Draft Unit" }));
      expect(draftUnit.status).toBe(201);
      const draftUnitId = draftUnit.body.data._id;
      const client = api(app, slug);

      const units = await client
        .get(`/api/v1/projects/${listing.projectId}/properties`)
        .set(bearer(cast.buyer.token));
      expect(units.status).toBe(200);
      expect(units.body.data.map((u) => u._id)).toEqual([listing.unitId]);

      const bySlug = await client
        .get(`/api/v1/projects/slug/${listing.projectSlug}`)
        .set(bearer(cast.buyer.token));
      expect(bySlug.body.data.units.map((u) => u._id)).toEqual([
        listing.unitId,
      ]);

      await client
        .get(`/api/v1/properties/${draftUnitId}`)
        .set(bearer(cast.buyer.token))
        .expect(404);

      const ownerUnits = await client
        .get(`/api/v1/projects/${listing.projectId}/properties`)
        .set(bearer(cast.owner.token));
      expect(ownerUnits.body.data.map((u) => u._id).sort()).toEqual(
        [listing.unitId, draftUnitId].sort(),
      );

      // An active unit under a project that is back in draft is not public.
      const orphan = await seedListing(app, slug, cast.owner.token, {
        projectStatus: "draft",
        unitStatus: "active",
        title: "Orphan Unit",
      });
      await client
        .get(`/api/v1/properties/${orphan.unitId}`)
        .set(bearer(cast.buyer.token))
        .expect(404);
      await client
        .get(`/api/v1/properties/${orphan.unitId}/nearby`)
        .set(bearer(cast.buyer.token))
        .expect(404);
      await client
        .get(`/api/v1/properties/${orphan.unitId}`)
        .set(bearer(cast.owner.token))
        .expect(200);
    });

    it("returns 404 to non-managers for trashed listings and 200 to the owner", async () => {
      const app = await getApp();
      const cast = await registerCast(app, slug);
      const client = api(app, slug);

      // Unit trashed by its owner (project stays live with another unit).
      const listing = await seedListing(app, slug, cast.owner.token);
      const keep = await api(app, slug)
        .post("/api/v1/properties")
        .set(bearer(cast.owner.token))
        .send(propertyPayload(listing.projectId, { title: "Keep Unit" }));
      await Property.findByIdAndUpdate(keep.body.data._id, {
        status: "active",
      });
      await client
        .delete(`/api/v1/properties/${listing.unitId}`)
        .set(bearer(cast.owner.token))
        .expect(200);

      for (const [label, viewer] of nonManagers(cast)) {
        const res = await client
          .get(`/api/v1/properties/${listing.unitId}`)
          .set(bearer(viewer.token));
        expect(res.status, label).toBe(404);
      }
      const ownerUnit = await client
        .get(`/api/v1/properties/${listing.unitId}`)
        .set(bearer(cast.owner.token));
      expect(ownerUnit.status).toBe(200);
      expect(ownerUnit.body.data.deletedAt).toBeTruthy();

      // Whole project trashed by its owner.
      await client
        .delete(`/api/v1/projects/${listing.projectId}`)
        .set(bearer(cast.owner.token))
        .expect(200);
      for (const [label, viewer] of nonManagers(cast)) {
        const reads = await readAll(app, slug, listing, viewer);
        expect(statusesOf(reads), label).toEqual(allStatuses(404));
      }
      const ownerProject = await client
        .get(`/api/v1/projects/${listing.projectId}`)
        .set(bearer(cast.owner.token));
      expect(ownerProject.status).toBe(200);
      expect(ownerProject.body.data.deletedAt).toBeTruthy();
      await client
        .get(`/api/v1/projects/${listing.projectId}/properties`)
        .set(bearer(cast.owner.token))
        .expect(200);
    });

    it("never matches a soft-deleted listing for non-managers, whatever its status", async () => {
      const app = await getApp();
      const cast = await registerCast(app, slug);
      const listing = await seedListing(app, slug, cast.owner.token);
      // deletedAt alone must hide it, even with a public status.
      const deletedAt = new Date();
      await Property.findByIdAndUpdate(listing.unitId, { deletedAt });
      await Project.findByIdAndUpdate(listing.projectId, { deletedAt });

      const client = api(app, slug);
      for (const [label, viewer] of nonManagers(cast)) {
        const unit = await client
          .get(`/api/v1/properties/${listing.unitId}`)
          .set(bearer(viewer.token));
        const project = await client
          .get(`/api/v1/projects/${listing.projectId}`)
          .set(bearer(viewer.token));
        const units = await client
          .get(`/api/v1/projects/${listing.projectId}/properties`)
          .set(bearer(viewer.token));
        expect([unit.status, project.status, units.status], label).toEqual([
          404, 404, 404,
        ]);
      }

      await client
        .get(`/api/v1/properties/${listing.unitId}`)
        .set(bearer(cast.owner.token))
        .expect(200);
      await client
        .get(`/api/v1/projects/${listing.projectId}`)
        .set(bearer(cast.owner.token))
        .expect(200);
    });
  });

  it("lets the assigned agent read a draft unit it does not own", async () => {
    const app = await getApp();
    const cast = await registerCast(app, BUYTLY);
    const listing = await seedListing(app, BUYTLY, cast.owner.token, {
      projectStatus: "draft",
      unitStatus: "draft",
    });
    await Property.findByIdAndUpdate(listing.unitId, {
      agentId: cast.otherAgent.userId,
    });
    const client = api(app, BUYTLY);

    const res = await client
      .get(`/api/v1/properties/${listing.unitId}`)
      .set(bearer(cast.otherAgent.token));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("draft");

    await client
      .get(`/api/v1/properties/${listing.unitId}`)
      .set(bearer(cast.buyer.token))
      .expect(404);
  });

  it("keeps an admin of another site out", async () => {
    const app = await getApp();
    const cast = await registerCast(app, BUYTLY);
    const listing = await seedListing(app, BUYTLY, cast.owner.token, {
      projectStatus: "draft",
      unitStatus: "draft",
    });
    const block57Admin = await registerOn(
      app,
      BLOCK57,
      "b57-read-admin@example.com",
      "buyer",
    );
    await User.findByIdAndUpdate(block57Admin.userId, { role: "admin" });

    // The Block 57 token is not valid on Buytly, so this is an anonymous read.
    const reads = await readAll(app, BUYTLY, listing, block57Admin);
    expect(statusesOf(reads)).toEqual(allStatuses(404));
    // And the listing does not exist on Block 57.
    const onBlock57 = await readAll(app, BLOCK57, listing, block57Admin);
    expect(statusesOf(onBlock57)).toEqual(allStatuses(404));
  });

  it("still refuses writes to another seller's listing", async () => {
    const app = await getApp();
    const cast = await registerCast(app, BUYTLY);
    const listing = await seedListing(app, BUYTLY, cast.owner.token);
    const intruder = bearer(cast.otherSeller.token);
    const client = api(app, BUYTLY);
    const fakeMediaId = new mongoose.Types.ObjectId().toString();

    const attempts = {
      patchProject: await client
        .patch(`/api/v1/projects/${listing.projectId}`)
        .set(intruder)
        .send({ title: "Hijacked Project" }),
      deleteProject: await client
        .delete(`/api/v1/projects/${listing.projectId}`)
        .set(intruder),
      permanentProject: await client
        .delete(`/api/v1/projects/${listing.projectId}/permanent`)
        .set(intruder),
      projectMedia: await client
        .delete(`/api/v1/projects/${listing.projectId}/media/${fakeMediaId}`)
        .set(intruder),
      projectMediaOrder: await client
        .put(`/api/v1/projects/${listing.projectId}/media/order`)
        .set(intruder)
        .send({ imageIds: [fakeMediaId] }),
      patchUnit: await client
        .patch(`/api/v1/properties/${listing.unitId}`)
        .set(intruder)
        .send({ title: "Hijacked Unit" }),
      markSold: await client
        .patch(`/api/v1/properties/${listing.unitId}`)
        .set(intruder)
        .send({ status: "sold" }),
      deleteUnit: await client
        .delete(`/api/v1/properties/${listing.unitId}`)
        .set(intruder),
      permanentUnit: await client
        .delete(`/api/v1/properties/${listing.unitId}/permanent`)
        .set(intruder),
      unitMedia: await client
        .delete(`/api/v1/properties/${listing.unitId}/media/${fakeMediaId}`)
        .set(intruder),
      unitMediaOrder: await client
        .put(`/api/v1/properties/${listing.unitId}/media/order`)
        .set(intruder)
        .send({ imageIds: [fakeMediaId] }),
    };

    expect(statusesOf(attempts)).toEqual({
      patchProject: 404,
      deleteProject: 403,
      permanentProject: 404,
      projectMedia: 404,
      projectMediaOrder: 404,
      patchUnit: 404,
      markSold: 404,
      deleteUnit: 403,
      permanentUnit: 404,
      unitMedia: 404,
      unitMediaOrder: 404,
    });

    const project = await Project.findById(listing.projectId).lean();
    const unit = await Property.findById(listing.unitId).lean();
    expect(project.title).toBe("Unit 1 Project");
    expect(project.status).toBe("active");
    expect(project.deletedAt).toBeNull();
    expect(unit.title).toBe("Unit 1");
    expect(unit.status).toBe("active");
    expect(unit.deletedAt).toBeNull();

    // Trashed by the owner: restore by someone else is still refused.
    await client
      .delete(`/api/v1/properties/${listing.unitId}`)
      .set(bearer(cast.owner.token))
      .expect(200);
    await client
      .patch(`/api/v1/properties/${listing.unitId}/restore`)
      .set(intruder)
      .expect(403);
    await client
      .delete(`/api/v1/properties/${listing.unitId}/permanent`)
      .set(intruder)
      .expect(404);
    const trashed = await Property.findById(listing.unitId).lean();
    expect(trashed.deletedAt).toBeTruthy();
  });
});
