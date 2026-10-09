import { beforeEach, describe, it, expect } from "vitest";
import { api } from "./helpers/http.js";
import { mongoAvailable } from "./setup.js";
import { ensureTestPropertyTypes } from "./helpers/catalogFixtures.js";
import { projectPayload, propertyPayload } from "./helpers/listingFixtures.js";
import { SITE_SLUG } from "../src/modules/sites/site.constants.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import {
  PRICE_ON_REQUEST_LABEL,
  applyPopulatedUnitPriceVisibility,
  hideProjectPriceRange,
  hideUnitPrice,
  siteHidesPublicPrices,
  withManagerFields,
} from "../src/shared/priceVisibility.js";

const { BLOCK57, BUYTLY } = SITE_SLUG;
// Distinctive value so a leak anywhere in a response body is detectable.
const HIDDEN_PRICE = 357357;

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

async function registerOn(app, slug, email, role = "seller") {
  const res = await api(app, slug).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    firstName: "Price",
    role,
  });
  expect(res.status, res.body?.message).toBe(201);
  const site = await Site.findOne({ slug }).lean();
  const user = await User.findOne({ email, siteId: site._id }).lean();
  return { token: res.body.data.accessToken, userId: String(user._id) };
}

async function makeAdmin(app, slug, email) {
  const account = await registerOn(app, slug, email, "buyer");
  await User.findByIdAndUpdate(account.userId, { role: "admin" });
  return account;
}

/** Project + one unit created through the API, then published. */
async function seedListing(app, slug, token, { price, title, projectTitle }) {
  const projectRes = await api(app, slug)
    .post("/api/v1/projects")
    .set(bearer(token))
    .send(projectPayload({ title: projectTitle }));
  expect(projectRes.status, projectRes.body?.message).toBe(201);
  const projectId = projectRes.body.data._id;

  const unitRes = await api(app, slug)
    .post("/api/v1/properties")
    .set(bearer(token))
    .send(
      propertyPayload(projectId, { title, price, building: "A", floor: 1 }),
    );
  expect(unitRes.status, unitRes.body?.message).toBe(201);
  const unitId = unitRes.body.data._id;

  await Property.findByIdAndUpdate(unitId, { status: "active" });
  await Project.findByIdAndUpdate(projectId, { status: "active" });
  return { projectId, unitId, slug: projectRes.body.data.slug };
}

const expectHiddenUnit = (unit) => {
  expect(unit).toBeDefined();
  expect(unit.price).toBeNull();
  expect(unit.priceLabel).toBe(PRICE_ON_REQUEST_LABEL);
};

const expectHiddenProject = (project) => {
  expect(project.priceMin).toBeNull();
  expect(project.priceMax).toBeNull();
  expect(project.priceLabel).toBe(PRICE_ON_REQUEST_LABEL);
};

const expectNoLeak = (res) =>
  expect(JSON.stringify(res.body)).not.toContain(String(HIDDEN_PRICE));

/** Detail read by a logged-in non-manager: 200, with the price hidden. */
const expectHiddenRead = (res, check) => {
  expectNoLeak(res);
  expect(res.status, res.body?.message).toBe(200);
  check(res.body.data);
};

describe("price visibility helpers", () => {
  it("only treats features.hidePublicPrices === true as hiding", () => {
    expect(
      siteHidesPublicPrices({ features: { hidePublicPrices: true } }),
    ).toBe(true);
    expect(
      siteHidesPublicPrices({ features: { hidePublicPrices: "yes" } }),
    ).toBe(false);
    expect(siteHidesPublicPrices({ features: {} })).toBe(false);
    expect(siteHidesPublicPrices(null)).toBe(false);
  });

  it("returns masked copies without mutating the input", () => {
    const unit = { _id: "u1", price: 10, currency: "USD" };
    expect(hideUnitPrice(unit)).toEqual({
      _id: "u1",
      price: null,
      currency: "USD",
      priceLabel: PRICE_ON_REQUEST_LABEL,
    });
    expect(unit.price).toBe(10);

    const project = { _id: "p1", priceMin: 1, priceMax: 2 };
    expect(hideProjectPriceRange(project)).toEqual({
      _id: "p1",
      priceMin: null,
      priceMax: null,
      priceLabel: PRICE_ON_REQUEST_LABEL,
    });
    expect(project.priceMin).toBe(1);
  });

  it("drops manager ids from populated units and masks unless managed", () => {
    const populated = { title: "A-1", price: 5, ownerId: "o", agentId: "a" };
    expect(applyPopulatedUnitPriceVisibility(populated, true)).toEqual({
      title: "A-1",
      price: 5,
    });
    expect(applyPopulatedUnitPriceVisibility(populated, false)).toEqual({
      title: "A-1",
      price: null,
      priceLabel: PRICE_ON_REQUEST_LABEL,
    });
    expect(applyPopulatedUnitPriceVisibility(null, false)).toBeNull();
    expect(withManagerFields("title price", false)).toBe("title price");
    expect(withManagerFields("title price", true)).toBe(
      "title price ownerId agentId",
    );
  });
});

describe.skipIf(!mongoAvailable)("hidden prices (block57)", () => {
  beforeEach(async () => {
    const block57 = await Site.findOne({ slug: BLOCK57 }).lean();
    await ensureTestPropertyTypes(block57._id);
  });

  const seedBlock57 = async (app) => {
    const seller = await registerOn(app, BLOCK57, "b57-seller@example.com");
    const listing = await seedListing(app, BLOCK57, seller.token, {
      price: HIDDEN_PRICE,
      title: "A-101",
      projectTitle: "Block 57 Residences",
    });
    return { seller, ...listing };
  };

  it("hides prices from anonymous viewers on every public read", async () => {
    const app = await getApp();
    const { unitId, projectId, slug } = await seedBlock57(app);
    const agent = await registerOn(
      app,
      BLOCK57,
      "b57-agent@example.com",
      "agent",
    );
    await Property.findByIdAndUpdate(unitId, { agentId: agent.userId });
    const block57 = api(app, BLOCK57);

    const list = await block57.get("/api/v1/properties");
    expect(list.status).toBe(200);
    expectHiddenUnit(list.body.data.find((row) => row._id === unitId));
    expectNoLeak(list);

    const detail = await block57.get(`/api/v1/properties/${unitId}`);
    expect(detail.status).toBe(200);
    expectHiddenUnit(detail.body.data);
    expect(detail.body.data.building).toBe("A");
    expectNoLeak(detail);

    const projects = await block57.get("/api/v1/projects");
    expectHiddenProject(
      projects.body.data.find((row) => row._id === projectId),
    );
    expectNoLeak(projects);

    const bySlug = await block57.get(`/api/v1/projects/slug/${slug}`);
    expect(bySlug.status).toBe(200);
    expectHiddenProject(bySlug.body.data);
    expectHiddenUnit(bySlug.body.data.units[0]);
    expectNoLeak(bySlug);

    const byId = await block57.get(
      `/api/v1/projects/${projectId}?includeUnits=true`,
    );
    expectHiddenProject(byId.body.data);
    expectHiddenUnit(byId.body.data.units[0]);
    expectNoLeak(byId);

    const units = await block57.get(`/api/v1/projects/${projectId}/properties`);
    expect(units.status).toBe(200);
    expectHiddenUnit(units.body.data[0]);
    expectNoLeak(units);

    const agentListings = await block57.get(
      `/api/v1/agents/${agent.userId}/properties`,
    );
    expect(agentListings.status).toBe(200);
    expectHiddenUnit(agentListings.body.data[0]);
    expectNoLeak(agentListings);

    // Stored price is untouched.
    expect((await Property.findById(unitId).lean()).price).toBe(HIDDEN_PRICE);
  });

  it("ignores price filters and price sort on the public list", async () => {
    const app = await getApp();
    const { unitId, projectId, seller } = await seedBlock57(app);
    const block57 = api(app, BLOCK57);

    // A cheaper, newer unit: price order is the reverse of createdAt order.
    const cheaper = await block57
      .post("/api/v1/properties")
      .set(bearer(seller.token))
      .send(propertyPayload(projectId, { title: "A-102", price: 1000 }));
    expect(cheaper.status, cheaper.body?.message).toBe(201);
    const cheaperId = cheaper.body.data._id;
    await Property.findByIdAndUpdate(cheaperId, { status: "active" });
    // Raw driver writes: Mongoose treats createdAt as immutable.
    await Property.collection.updateOne(
      { _id: new Property.base.Types.ObjectId(unitId) },
      { $set: { createdAt: new Date("2026-01-01T00:00:00Z") } },
    );
    await Property.collection.updateOne(
      { _id: new Property.base.Types.ObjectId(cheaperId) },
      { $set: { createdAt: new Date("2026-01-02T00:00:00Z") } },
    );

    for (const query of ["minPrice=999999999", "maxPrice=1"]) {
      const res = await block57.get(`/api/v1/properties?${query}`);
      expect(res.status).toBe(200);
      expect(res.body.data.map((row) => row._id)).toContain(unitId);
      expect(res.body.data.map((row) => row._id)).toContain(cheaperId);
      expectNoLeak(res);
    }

    // sortBy=price falls back to createdAt in the requested direction.
    for (const [sortOrder, expected] of [
      ["asc", [unitId, cheaperId]],
      ["desc", [cheaperId, unitId]],
    ]) {
      const res = await block57.get(
        `/api/v1/properties?sortBy=price&sortOrder=${sortOrder}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.data.map((row) => row._id)).toEqual(expected);
      expectNoLeak(res);
    }
  });

  it("hides prices from a logged-in buyer, including personal lists", async () => {
    const app = await getApp();
    const { unitId, projectId, slug, seller } = await seedBlock57(app);
    const buyer = await registerOn(
      app,
      BLOCK57,
      "b57-buyer@example.com",
      "buyer",
    );
    const block57 = api(app, BLOCK57);

    const detail = await block57
      .get(`/api/v1/properties/${unitId}`)
      .set(bearer(buyer.token));
    expectHiddenRead(detail, expectHiddenUnit);

    const bySlug = await block57
      .get(`/api/v1/projects/slug/${slug}`)
      .set(bearer(buyer.token));
    expectHiddenRead(bySlug, (project) => {
      expectHiddenProject(project);
      expectHiddenUnit(project.units[0]);
    });

    const units = await block57
      .get(`/api/v1/projects/${projectId}/properties`)
      .set(bearer(buyer.token));
    expectHiddenRead(units, (rows) => expectHiddenUnit(rows[0]));

    // Public lists carry no auth: hidden for everyone.
    const list = await block57
      .get("/api/v1/properties")
      .set(bearer(buyer.token));
    expectHiddenUnit(list.body.data.find((row) => row._id === unitId));
    const projects = await block57
      .get("/api/v1/projects")
      .set(bearer(buyer.token));
    expectHiddenProject(projects.body.data[0]);

    await block57
      .post("/api/v1/favorites")
      .set(bearer(buyer.token))
      .send({ propertyId: unitId })
      .expect(201);
    const favorites = await block57
      .get("/api/v1/favorites")
      .set(bearer(buyer.token));
    expect(favorites.status).toBe(200);
    expectHiddenUnit(favorites.body.data[0].property);
    expect(favorites.body.data[0].property).not.toHaveProperty("ownerId");
    expect(favorites.body.data[0].property).not.toHaveProperty("agentId");
    expectNoLeak(favorites);

    await block57
      .post("/api/v1/bookings")
      .set(bearer(buyer.token))
      .send({
        propertyId: unitId,
        scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
      })
      .expect(201);
    const bookings = await block57
      .get("/api/v1/bookings/my")
      .set(bearer(buyer.token));
    expect(bookings.status).toBe(200);
    expectHiddenUnit(bookings.body.data[0].propertyId);
    expect(bookings.body.data[0].propertyId).not.toHaveProperty("ownerId");
    expectNoLeak(bookings);

    const created = await block57
      .post("/api/v1/transactions")
      .set(bearer(buyer.token))
      .send({ propertyId: unitId, type: "buy", amount: 300000 });
    expect(created.status).toBe(201);
    expectHiddenUnit(created.body.data.propertyId);
    expect(created.body.data.amount).toBe(300000);
    expectNoLeak(created);
    const transactionId = created.body.data._id;

    const mine = await block57
      .get("/api/v1/transactions/my")
      .set(bearer(buyer.token));
    expectHiddenUnit(mine.body.data[0].propertyId);
    expectNoLeak(mine);

    const one = await block57
      .get(`/api/v1/transactions/${transactionId}`)
      .set(bearer(buyer.token));
    expectHiddenUnit(one.body.data.propertyId);
    expectNoLeak(one);

    // The seller is a party and manages the unit: real price, no manager ids leaked.
    const sellerView = await block57
      .get(`/api/v1/transactions/${transactionId}`)
      .set(bearer(seller.token));
    expect(sellerView.body.data.propertyId.price).toBe(HIDDEN_PRICE);
    expect(sellerView.body.data.propertyId).not.toHaveProperty("priceLabel");
    expect(sellerView.body.data.propertyId).not.toHaveProperty("ownerId");
  });

  it("shows real prices to the owner and the block57 admin", async () => {
    const app = await getApp();
    const { unitId, projectId, slug, seller } = await seedBlock57(app);
    const admin = await makeAdmin(app, BLOCK57, "b57-admin@example.com");
    const block57 = api(app, BLOCK57);

    for (const token of [seller.token, admin.token]) {
      const detail = await block57
        .get(`/api/v1/properties/${unitId}`)
        .set(bearer(token));
      expect(detail.body.data.price).toBe(HIDDEN_PRICE);
      expect(detail.body.data).not.toHaveProperty("priceLabel");

      const bySlug = await block57
        .get(`/api/v1/projects/slug/${slug}`)
        .set(bearer(token));
      expect(bySlug.body.data.priceMin).toBe(HIDDEN_PRICE);
      expect(bySlug.body.data.priceMax).toBe(HIDDEN_PRICE);
      expect(bySlug.body.data).not.toHaveProperty("priceLabel");
      expect(bySlug.body.data.units[0].price).toBe(HIDDEN_PRICE);

      const units = await block57
        .get(`/api/v1/projects/${projectId}/properties`)
        .set(bearer(token));
      expect(units.body.data[0].price).toBe(HIDDEN_PRICE);
      expect(units.body.data[0]).not.toHaveProperty("priceLabel");
    }

    const mine = await block57
      .get("/api/v1/properties/mine")
      .set(bearer(seller.token));
    expect(mine.body.data[0].price).toBe(HIDDEN_PRICE);
  });

  it("shows a unit's price to its assigned agent", async () => {
    const app = await getApp();
    const { unitId } = await seedBlock57(app);
    const agent = await registerOn(
      app,
      BLOCK57,
      "b57-unit-agent@example.com",
      "agent",
    );
    await Property.findByIdAndUpdate(unitId, { agentId: agent.userId });

    const detail = await api(app, BLOCK57)
      .get(`/api/v1/properties/${unitId}`)
      .set(bearer(agent.token));

    expect(detail.status).toBe(200);
    expect(detail.body.data.price).toBe(HIDDEN_PRICE);
    expect(detail.body.data).not.toHaveProperty("priceLabel");
  });

  it("leaves Buytly listings unchanged", async () => {
    const app = await getApp();
    const seller = await registerOn(app, BUYTLY, "buytly-price@example.com");
    const { unitId, projectId } = await seedListing(app, BUYTLY, seller.token, {
      price: 350000,
      title: "Buytly Unit",
      projectTitle: "Buytly Project",
    });
    const buytly = api(app, BUYTLY);

    const detail = await buytly.get(`/api/v1/properties/${unitId}`);
    expect(detail.body.data.price).toBe(350000);
    expect(detail.body.data).not.toHaveProperty("priceLabel");

    const list = await buytly.get("/api/v1/properties?minPrice=100000");
    expect(list.body.data.map((row) => row._id)).toContain(unitId);

    const projects = await buytly.get("/api/v1/projects");
    const project = projects.body.data.find((row) => row._id === projectId);
    expect(project.priceMin).toBe(350000);
    expect(project).not.toHaveProperty("priceLabel");

    const units = await buytly.get(`/api/v1/projects/${projectId}/properties`);
    expect(units.body.data[0].price).toBe(350000);
    expect(units.body.data[0]).not.toHaveProperty("priceLabel");
  });

  it("hides block57 prices on the Buytly platform feeds (source site decides)", async () => {
    const app = await getApp();
    const { unitId, projectId } = await seedBlock57(app);
    const buytlyAdmin = await makeAdmin(
      app,
      BUYTLY,
      "buytly-feature-admin@example.com",
    );
    const buytly = api(app, BUYTLY);

    await buytly
      .patch(`/api/v1/admin/projects/${projectId}/platform-featured`)
      .set(bearer(buytlyAdmin.token))
      .send({ visibleOnPlatform: true })
      .expect(200);
    await buytly
      .patch(`/api/v1/admin/properties/${unitId}/platform-featured`)
      .set(bearer(buytlyAdmin.token))
      .send({ visibleOnPlatform: true })
      .expect(200);

    const buytlySeller = await registerOn(
      app,
      BUYTLY,
      "buytly-first-party@example.com",
    );
    const firstParty = await seedListing(app, BUYTLY, buytlySeller.token, {
      price: 500000,
      title: "Buytly First Party",
      projectTitle: "Buytly First Party Project",
    });

    const listings = await buytly
      .get("/api/v1/platform/featured-listings?limit=50")
      .set(bearer(buytlyAdmin.token));
    expect(listings.status).toBe(200);
    const partnerRow = listings.body.data.find((row) => row._id === unitId);
    expectHiddenUnit(partnerRow);
    expect(partnerRow.sourceSite.slug).toBe(BLOCK57);
    expect(partnerRow.sourceSite.listingUrl).toMatch(
      /^http:\/\/localhost:3002\/single-v1\//,
    );
    const ownRow = listings.body.data.find(
      (row) => row._id === firstParty.unitId,
    );
    expect(ownRow.price).toBe(500000);
    expect(ownRow).not.toHaveProperty("priceLabel");
    expectNoLeak(listings);

    const projects = await buytly.get(
      "/api/v1/platform/featured-projects?limit=50",
    );
    expect(projects.status).toBe(200);
    expectHiddenProject(
      projects.body.data.find((row) => row._id === projectId),
    );
    const ownProject = projects.body.data.find(
      (row) => row._id === firstParty.projectId,
    );
    expect(ownProject).not.toHaveProperty("priceLabel");
    expect(ownProject).not.toHaveProperty("priceMin");
  });

  it("excludes hidden-price units from platform price filters and sorts them last", async () => {
    const app = await getApp();
    const { unitId, projectId } = await seedBlock57(app);
    // Cheapest unit overall, so a plain price sort would list it first.
    await Property.findByIdAndUpdate(unitId, {
      price: 100000,
      visibleOnPlatform: true,
    });
    await Project.findByIdAndUpdate(projectId, { visibleOnPlatform: true });

    const buytlySeller = await registerOn(
      app,
      BUYTLY,
      "buytly-sort@example.com",
    );
    const cheap = await seedListing(app, BUYTLY, buytlySeller.token, {
      price: 500000,
      title: "Buytly 500k",
      projectTitle: "Buytly Sort A",
    });
    const pricey = await seedListing(app, BUYTLY, buytlySeller.token, {
      price: 700000,
      title: "Buytly 700k",
      projectTitle: "Buytly Sort B",
    });
    const buytly = api(app, BUYTLY);
    const ids = (res) => res.body.data.map((row) => row._id);

    const all = await buytly.get("/api/v1/platform/featured-listings");
    expect(ids(all)).toEqual(expect.arrayContaining([unitId]));

    const ranged = await buytly.get(
      "/api/v1/platform/featured-listings?minPrice=1",
    );
    expect(ids(ranged)).toContain(cheap.unitId);
    expect(ids(ranged)).not.toContain(unitId);

    const belowReal = await buytly.get(
      "/api/v1/platform/featured-listings?maxPrice=200000",
    );
    expect(ids(belowReal)).toEqual([]);

    const asc = await buytly.get(
      "/api/v1/platform/featured-listings?sortBy=price&sortOrder=asc",
    );
    expect(ids(asc)).toEqual([cheap.unitId, pricey.unitId, unitId]);

    const desc = await buytly.get(
      "/api/v1/platform/featured-listings?sortBy=price&sortOrder=desc",
    );
    expect(ids(desc)).toEqual([pricey.unitId, cheap.unitId, unitId]);

    const page1 = await buytly.get(
      "/api/v1/platform/featured-listings?sortBy=price&sortOrder=asc&limit=2&page=1",
    );
    expect(ids(page1)).toEqual([cheap.unitId, pricey.unitId]);
    expect(page1.body.pagination.total).toBe(3);

    const page2 = await buytly.get(
      "/api/v1/platform/featured-listings?sortBy=price&sortOrder=asc&limit=2&page=2",
    );
    expect(ids(page2)).toEqual([unitId]);
    expectHiddenUnit(page2.body.data[0]);
  });
});
