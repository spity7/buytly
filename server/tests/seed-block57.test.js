import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { mongoAvailable } from "./setup.js";
import { api } from "./helpers/http.js";
import {
  BLOCK57_AMENITIES,
  BLOCK57_DEACTIVATED_AMENITIES,
  BLOCK57_PROJECT_SLUG,
  BLOCK57_PROPERTY_TYPES,
  parseBlock57Units,
  seedBlock57,
} from "../scripts/seed/block57.js";
import { Site } from "../src/modules/sites/site.model.js";
import {
  PLATFORM_PERMISSIONS,
  SITE_SLUG,
} from "../src/modules/sites/site.constants.js";
import { User } from "../src/modules/users/user.model.js";
import { RefreshToken } from "../src/modules/auth/refreshToken.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { PropertyTypeCatalog } from "../src/modules/catalog/property-type.model.js";
import { AmenityCatalog } from "../src/modules/catalog/amenity.model.js";
import { DEFAULT_AMENITIES } from "../src/modules/catalog/catalog.defaults.js";
import { Notification } from "../src/modules/notifications/notification.model.js";

const EXAMPLE_UNITS_FILE = fileURLToPath(
  new URL("../scripts/seed/block57-units.example.json", import.meta.url),
);
const ADMIN_EMAIL = "sales@block57.test";
const ADMIN_PASSWORD = "Block57-Test-Only-1";

const runSeed = (options = {}) =>
  seedBlock57({
    adminEmail: ADMIN_EMAIL,
    adminPassword: ADMIN_PASSWORD,
    log: () => {},
    ...options,
  });

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const getSiteId = async (slug = SITE_SLUG.BLOCK57) =>
  (await Site.findOne({ slug }).lean())._id;

const unitsByTitle = async (siteId) =>
  new Map((await Property.find({ siteId })).map((unit) => [unit.title, unit]));

const unit = (overrides = {}) => ({
  title: "A-101",
  type: "executive-studio",
  building: "A",
  floor: 1,
  bedrooms: 0,
  bathrooms: 1,
  area: 45,
  price: 150000,
  ...overrides,
});

describe("Block 57 seed: units file validation", () => {
  it("rejects anything but an array", () => {
    expect(() => parseBlock57Units({ units: [] })).toThrow(
      "Units file must contain a JSON array of units",
    );
  });

  it("defaults status to pending and trims titles", () => {
    const [parsed] = parseBlock57Units([unit({ title: "  A-101 " })]);
    expect(parsed.status).toBe("pending");
    expect(parsed.title).toBe("A-101");
  });

  it("lists every invalid entry using the property API rules", () => {
    let message = "";
    try {
      parseBlock57Units([
        unit({ title: "A1" }),
        unit({ title: "A-102", price: 1500.5 }),
        unit({ title: "A-103", status: "active" }),
        unit({ title: "A-104", bedroom: 2 }),
        unit({ title: "A-105", floor: 1.5 }),
        unit({ title: "A-106" }),
        unit({ title: "A-106" }),
      ]);
    } catch (error) {
      message = error.message;
    }

    expect(message).toMatch(/^Invalid units file:/);
    expect(message).toContain('unit #1 ("A1"): title');
    expect(message).toContain('unit #2 ("A-102"): price');
    expect(message).toContain('unit #3 ("A-103"): status');
    expect(message).toContain(
      "unit #4 (\"A-104\"): Unrecognized key(s) in object: 'bedroom'",
    );
    expect(message).toContain('unit #5 ("A-105"): floor');
    expect(message).toContain('unit #7 ("A-106"): duplicate title in file');
    expect(message).not.toContain("unit #6");
  });
});

describe.skipIf(!mongoAvailable)("Block 57 seed script", () => {
  it("bootstraps the tenant and creates nothing twice on re-run", async () => {
    const first = await runSeed({ unitsFile: EXAMPLE_UNITS_FILE });
    const second = await runSeed({ unitsFile: EXAMPLE_UNITS_FILE });
    const siteId = await getSiteId();

    expect(first.site.slug).toBe(SITE_SLUG.BLOCK57);
    expect(first.site.publicUrl).toBe("http://localhost:3002");
    expect(first.admin.created).toBe(true);
    expect(second.admin).toMatchObject({
      created: false,
      changes: [],
      passwordReset: false,
    });
    expect(first.propertyTypes).toEqual({ created: 6, existing: 0 });
    expect(second.propertyTypes).toEqual({ created: 0, existing: 6 });
    expect(first.amenities).toEqual({
      created: 6,
      activated: 0,
      deactivated: 3,
    });
    expect(second.amenities).toEqual({
      created: 0,
      activated: 0,
      deactivated: 0,
    });
    expect(first.project).toMatchObject({
      slug: BLOCK57_PROJECT_SLUG,
      created: true,
      status: "draft",
      unitsByStatus: { pending: 5, sold: 1 },
    });
    expect(second.project).toMatchObject({ created: false, status: "draft" });
    expect(first.units).toEqual({
      inFile: 6,
      created: 6,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      changes: [],
    });
    expect(second.units).toEqual({
      inFile: 6,
      created: 0,
      updated: 0,
      unchanged: 6,
      skipped: 0,
      changes: [],
    });
    expect(second.warnings).toEqual([]);

    expect(await User.countDocuments({ siteId })).toBe(1);
    expect(await PropertyTypeCatalog.countDocuments({ siteId })).toBe(6);
    expect(await AmenityCatalog.countDocuments({ siteId })).toBe(
      DEFAULT_AMENITIES.length + 6,
    );
    expect(await Project.countDocuments({ siteId })).toBe(1);
    expect(await Property.countDocuments({ siteId })).toBe(6);
  });

  it("sets up the Block 57 catalog without touching other sites", async () => {
    const siteId = await getSiteId();
    // Dashboard edits made before the seed runs.
    await AmenityCatalog.create({
      siteId,
      value: "Swimming Pool",
      label: "Pool",
      sortOrder: 6,
      isActive: false,
    });
    await PropertyTypeCatalog.create({
      siteId,
      value: "penthouse",
      label: "Sky Penthouse",
      sortOrder: 60,
    });

    const summary = await runSeed();

    expect(summary.amenities.activated).toBe(1);
    expect(summary.propertyTypes).toEqual({ created: 5, existing: 1 });

    const types = await PropertyTypeCatalog.find({ siteId }).sort({
      sortOrder: 1,
    });
    expect(types.map((row) => [row.value, row.label, row.isActive])).toEqual([
      ["executive-studio", "Executive Studio", true],
      ["one-bedroom", "1 Bedroom", true],
      ["two-bedroom", "2 Bedroom", true],
      ["townhouse", "Townhouse", true],
      ["urban-villa", "Urban Villa", true],
      ["penthouse", "Sky Penthouse", true],
    ]);
    expect(BLOCK57_PROPERTY_TYPES).toHaveLength(6);

    const amenities = new Map(
      (await AmenityCatalog.find({ siteId })).map((row) => [row.value, row]),
    );
    for (const entry of BLOCK57_AMENITIES) {
      expect(amenities.get(entry.value)?.isActive, entry.value).toBe(true);
    }
    expect(amenities.get("Swimming Pool").label).toBe("Pool");
    expect(amenities.get("Rooftop Lounge").label).toBe("Rooftop Lounge");
    for (const entry of BLOCK57_DEACTIVATED_AMENITIES) {
      expect(amenities.get(entry.value)?.isActive, entry.value).toBe(false);
    }
    expect(amenities.get("Gym").isActive).toBe(true);

    const buytlyId = await getSiteId(SITE_SLUG.BUYTLY);
    const buytlySeaView = await AmenityCatalog.findOne({
      siteId: buytlyId,
      value: "Sea View",
    });
    expect(buytlySeaView.isActive).toBe(true);
    expect(
      await PropertyTypeCatalog.countDocuments({
        siteId: buytlyId,
        value: "executive-studio",
      }),
    ).toBe(0);
  });

  it("creates a verified admin with no platform permissions that can sign in on Block 57 only", async () => {
    await runSeed();
    const siteId = await getSiteId();
    const admin = await User.findOne({ siteId, email: ADMIN_EMAIL }).select(
      "+passwordHash",
    );

    expect(admin).toMatchObject({
      role: "admin",
      isEmailVerified: true,
      isActive: true,
      authProvider: "local",
      firstName: "Block 57",
      lastName: "Sales",
      phone: "+233244777772",
      phoneCountryCode: "+233",
    });
    expect(admin.platformPermissions).toEqual([]);
    expect(await bcrypt.compare(ADMIN_PASSWORD, admin.passwordHash)).toBe(true);

    const app = await getApp();
    const credentials = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
    const login = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/login")
      .send(credentials);
    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe("admin");
    expect(login.body.data.user.platformPermissions).toEqual([]);

    const otherSite = await api(app, SITE_SLUG.BUYTLY)
      .post("/api/v1/auth/login")
      .send(credentials);
    expect(otherSite.status).toBe(401);
  });

  it("refuses to promote an existing non-admin account unless --promote-existing is passed", async () => {
    // Anyone can register the admin mailbox on block57 before the seed runs.
    const app = await getApp();
    const squatterPassword = "Squatter-Pass-1";
    const register = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/register")
      .send({
        email: ADMIN_EMAIL,
        password: squatterPassword,
        confirmPassword: squatterPassword,
        firstName: "Not",
        role: "buyer",
      });
    expect(register.status, register.body?.message).toBe(201);
    const siteId = await getSiteId();
    const existing = await User.findOne({ siteId, email: ADMIN_EMAIL });
    await User.updateOne(
      { _id: existing._id },
      {
        platformPermissions: [PLATFORM_PERMISSIONS.CROSS_SITE_READ],
        passwordResetToken: "pending-reset-hash",
        passwordResetExpires: new Date(Date.now() + 60_000),
      },
    );
    expect(await RefreshToken.countDocuments({ userId: existing._id })).toBe(1);

    const error = await runSeed().catch((err) => err);
    expect(error.message).toMatch(
      /already has a buyer account on block57 that this script did not create/,
    );
    expect(error.message).toContain("--promote-existing");
    let user = await User.findById(existing._id).select("+passwordHash");
    expect(user.role).toBe("buyer");
    expect(await bcrypt.compare(squatterPassword, user.passwordHash)).toBe(
      true,
    );
    expect(await Project.countDocuments({ siteId })).toBe(0);

    // Explicit promotion is a forced password reset: only the operator's
    // password works and the registrant's sessions are revoked.
    const promoted = await runSeed({ promoteExisting: true });
    user = await User.findById(existing._id).select(
      "+passwordHash +passwordResetToken +emailVerificationToken",
    );
    expect(promoted.admin).toMatchObject({
      created: false,
      passwordReset: true,
      changes: ["role buyer -> admin", "platform permissions removed"],
    });
    expect(user.role).toBe("admin");
    expect(user.platformPermissions).toEqual([]);
    expect(user.isEmailVerified).toBe(false);
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.emailVerificationToken).toBeUndefined();
    expect(await bcrypt.compare(ADMIN_PASSWORD, user.passwordHash)).toBe(true);
    expect(
      await RefreshToken.countDocuments({
        userId: existing._id,
        revokedAt: null,
      }),
    ).toBe(0);

    const oldLogin = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: squatterPassword });
    expect(oldLogin.status).toBe(401);
    expect(await User.countDocuments({ siteId })).toBe(1);
  });

  it("keeps an existing admin's password unless a reset is requested", async () => {
    await runSeed();
    const siteId = await getSiteId();
    const existing = await User.findOne({ siteId, email: ADMIN_EMAIL });
    const changedPassword = "Changed-In-Dashboard-1";
    await User.updateOne(
      { _id: existing._id },
      {
        passwordHash: await bcrypt.hash(changedPassword, 4),
        platformPermissions: [PLATFORM_PERMISSIONS.CROSS_SITE_READ],
      },
    );
    await RefreshToken.create({
      userId: existing._id,
      siteId,
      tokenHash: "seed-block57-test-token",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const kept = await runSeed();
    let admin = await User.findById(existing._id).select("+passwordHash");
    expect(kept.admin).toMatchObject({
      created: false,
      passwordReset: false,
      changes: ["platform permissions removed"],
    });
    expect(admin.platformPermissions).toEqual([]);
    expect(await bcrypt.compare(changedPassword, admin.passwordHash)).toBe(
      true,
    );
    expect(
      (await RefreshToken.findOne({ userId: existing._id })).revokedAt,
    ).toBeNull();

    const reset = await runSeed({ resetAdminPassword: true });
    admin = await User.findById(existing._id).select("+passwordHash");
    expect(reset.admin).toMatchObject({ passwordReset: true, changes: [] });
    expect(await bcrypt.compare(ADMIN_PASSWORD, admin.passwordHash)).toBe(true);
    expect(
      (await RefreshToken.findOne({ userId: existing._id })).revokedAt,
    ).toBeInstanceOf(Date);
    expect(await User.countDocuments({ siteId })).toBe(1);
  });

  it("fails clearly before writing anything when input is missing or invalid", async () => {
    await expect(seedBlock57({ log: () => {} })).rejects.toThrow(
      "BLOCK57_ADMIN_EMAIL is required; BLOCK57_ADMIN_PASSWORD is required",
    );

    const shortPassword = "short1";
    const error = await runSeed({ adminPassword: shortPassword }).catch(
      (err) => err,
    );
    expect(error.message).toBe(
      "BLOCK57_ADMIN_PASSWORD must be 8-128 characters",
    );
    expect(error.message).not.toContain(shortPassword);

    await expect(runSeed({ adminEmail: "not-an-email" })).rejects.toThrow(
      "BLOCK57_ADMIN_EMAIL must be a valid email address",
    );
    await expect(runSeed({ units: [unit({ title: "A1" })] })).rejects.toThrow(
      /^Invalid units file:/,
    );
    await expect(runSeed({ coordinates: { lat: 95, lng: 0 } })).rejects.toThrow(
      /^Invalid coordinates: lat/,
    );

    const siteId = await getSiteId();
    expect(await User.countDocuments({ siteId })).toBe(0);
    expect(await Project.countDocuments({ siteId })).toBe(0);
  });

  it("rejects units whose type is not an active Block 57 property type", async () => {
    await expect(
      runSeed({ units: [unit(), unit({ title: "A-102", type: "loft" })] }),
    ).rejects.toThrow("Units use unknown or inactive property types: loft");

    const siteId = await getSiteId();
    expect(await Property.countDocuments({ siteId })).toBe(0);
  });

  it("creates units with building, floor, the project location and the project owner", async () => {
    const summary = await runSeed({
      coordinates: { lat: 5.5801, lng: -0.1722 },
      units: [
        unit(),
        unit({
          title: "C-702",
          type: "two-bedroom",
          building: "C",
          floor: 7,
          status: "sold",
        }),
        unit({
          title: "B-TH1",
          type: "townhouse",
          building: "Block B",
          floor: 0,
        }),
      ],
    });
    const siteId = await getSiteId();
    const project = await Project.findOne({
      siteId,
      slug: BLOCK57_PROJECT_SLUG,
    });
    const units = await unitsByTitle(siteId);

    expect(project.location.coordinates).toEqual([-0.1722, 5.5801]);
    expect(project.location).toMatchObject({
      address: "54E First Circular Crescent, Cantonments",
      city: "Accra",
      country: "Ghana",
    });
    expect(project.title).toBe("Block 57");
    expect(project.description).toMatch(/^Block 57 was created to challenge/);
    expect(project.amenities).toEqual(BLOCK57_AMENITIES.map((a) => a.value));
    expect(String(project.ownerId)).toBe(String(summary.admin.id));

    const a101 = units.get("A-101");
    expect(a101).toMatchObject({
      slug: "a-101",
      type: "executive-studio",
      building: "A",
      floor: 1,
      price: 150000,
      currency: "USD",
      status: "pending",
    });
    expect(a101.description).toBe(
      "Executive Studio residence in Block A, floor 1, at Block 57, Cantonments, Accra.",
    );
    expect(units.get("C-702").status).toBe("sold");
    expect(units.get("B-TH1").description).toBe(
      "Townhouse residence in Block B, ground floor, at Block 57, Cantonments, Accra.",
    );
    for (const row of units.values()) {
      expect(String(row.projectId)).toBe(String(project._id));
      expect(String(row.ownerId)).toBe(String(project.ownerId));
      expect(row.location.coordinates).toEqual([-0.1722, 5.5801]);
      expect(row.location.city).toBe("Accra");
    }
  });

  it("updates units on re-run, clears values with null and only moves status forward", async () => {
    await runSeed({
      units: [
        unit(),
        unit({ title: "A-204", type: "one-bedroom", floor: 2 }),
        unit({
          title: "B-302",
          type: "two-bedroom",
          building: "B",
          status: "sold",
        }),
      ],
    });

    const summary = await runSeed({
      units: [
        unit({
          price: 155000,
          floor: 2,
          description: "Corner Executive Studio.",
        }),
        unit({
          title: "A-204",
          type: "one-bedroom",
          building: null,
          floor: 2,
          status: "sold",
        }),
        unit({
          title: "B-302",
          type: "two-bedroom",
          building: "B",
          status: "pending",
        }),
      ],
    });

    expect(summary.units).toEqual({
      inFile: 3,
      created: 0,
      updated: 2,
      unchanged: 1,
      skipped: 0,
      changes: [
        "A-101 price: 150000 -> 155000",
        "A-101 description: replaced",
        "A-101 floor: 1 -> 2",
        'A-204 building: "A" -> (empty)',
        'A-204 status: "pending" -> "sold"',
      ],
    });
    expect(summary.warnings).toEqual([
      'Unit "B-302" is sold in the database; kept as sold',
    ]);

    const units = await unitsByTitle(await getSiteId());
    expect(units.size).toBe(3);
    expect(units.get("A-101")).toMatchObject({
      price: 155000,
      floor: 2,
      description: "Corner Executive Studio.",
      status: "pending",
    });
    expect(units.get("A-204").building).toBeUndefined();
    expect(units.get("A-204").status).toBe("sold");
    expect(units.get("B-302").status).toBe("sold");
  });

  it("--activate approves the project and its pending units through admin moderation", async () => {
    const summary = await runSeed({
      unitsFile: EXAMPLE_UNITS_FILE,
      activate: true,
    });
    const siteId = await getSiteId();

    expect(summary.activation).toEqual({
      activated: true,
      statusBefore: "draft",
      unitsActivated: 5,
      draftUnits: 0,
    });
    expect(summary.project).toMatchObject({
      status: "active",
      unitsByStatus: { active: 5, sold: 1 },
    });
    expect(
      await Notification.exists({
        userId: summary.admin.id,
        title: "Project status: active",
      }),
    ).toBeTruthy();

    // Publicly readable on the Block 57 site, with prices hidden.
    const app = await getApp();
    const res = await api(app, SITE_SLUG.BLOCK57).get(
      `/api/v1/projects/slug/${BLOCK57_PROJECT_SLUG}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("active");
    expect(res.body.data.units).toHaveLength(6);
    for (const row of res.body.data.units) {
      expect(row.price).toBeNull();
      expect(row.building).toMatch(/^[ABC]$/);
      expect(typeof row.floor).toBe("number");
    }
    expect(await Project.countDocuments({ siteId })).toBe(1);
  });

  it("never downgrades an active project or its active units", async () => {
    await runSeed({ unitsFile: EXAMPLE_UNITS_FILE, activate: true });

    const rerun = await runSeed({ unitsFile: EXAMPLE_UNITS_FILE });
    expect(rerun.project).toMatchObject({
      status: "active",
      unitsByStatus: { active: 5, sold: 1 },
    });
    expect(rerun.units.unchanged).toBe(6);

    const again = await runSeed({ activate: true });
    expect(again.activation).toMatchObject({
      activated: false,
      reason: "already active with no pending units",
    });

    // A unit added later stays pending until the next --activate.
    const added = await runSeed({
      units: [
        unit({ title: "C-901", type: "penthouse", building: "C", floor: 9 }),
      ],
    });
    expect(added.project.unitsByStatus).toEqual({
      pending: 1,
      active: 5,
      sold: 1,
    });
    const activated = await runSeed({ activate: true });
    expect(activated.activation).toMatchObject({
      activated: true,
      statusBefore: "active",
      unitsActivated: 1,
    });
    expect(activated.project.unitsByStatus).toEqual({ active: 6, sold: 1 });
  });

  it("skips activation when no unit is pending or active", async () => {
    const empty = await runSeed({ activate: true });
    expect(empty.activation).toMatchObject({
      activated: false,
      reason: "the project needs at least one pending or active unit",
    });
    expect(empty.project.status).toBe("draft");

    const allSold = await runSeed({
      units: [unit({ status: "sold" })],
      activate: true,
    });
    expect(allSold.activation.activated).toBe(false);
    expect(allSold.project.status).toBe("draft");
  });

  it("refuses to touch a project that is in the trash", async () => {
    await runSeed();
    const siteId = await getSiteId();
    await Project.updateOne(
      { siteId, slug: BLOCK57_PROJECT_SLUG },
      { status: "archived", deletedAt: new Date() },
    );

    await expect(runSeed({ units: [unit()] })).rejects.toThrow(
      /project is in the trash/,
    );
    expect(await Project.countDocuments({ siteId })).toBe(1);
    expect(await Property.countDocuments({ siteId })).toBe(0);
  });

  it("refuses a block-57 project created by another account and leaves it untouched", async () => {
    // A self-registered seller grabs the slug before the first seed run.
    const app = await getApp();
    const register = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/register")
      .send({
        email: "squatter@example.com",
        password: "Squatter-Pass-1",
        confirmPassword: "Squatter-Pass-1",
        firstName: "Squatter",
        role: "seller",
      });
    expect(register.status, register.body?.message).toBe(201);
    const created = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${register.body.data.accessToken}`)
      .send({
        title: "Block 57",
        description: "A project that is not the official development.",
        location: {
          coordinates: [-0.1745, 5.5786],
          address: "Somewhere",
          city: "Accra",
          country: "Ghana",
        },
        amenities: [],
        status: "draft",
      });
    expect(created.status, created.body?.message).toBe(201);
    expect(created.body.data.slug).toBe(BLOCK57_PROJECT_SLUG);

    const error = await runSeed({
      unitsFile: EXAMPLE_UNITS_FILE,
      activate: true,
    }).catch((err) => err);
    expect(error.message).toBe(
      'The "block-57" project is owned by squatter@example.com (seller), not by a block57 admin. ' +
        "Refusing to add units to it or publish it. Rename or delete it from the admin dashboard, then re-run.",
    );

    const siteId = await getSiteId();
    const project = await Project.findById(created.body.data._id);
    expect(project.status).toBe("draft");
    expect(await Project.countDocuments({ siteId })).toBe(1);
    expect(await Property.countDocuments({ siteId })).toBe(0);
  });

  it("adopts a block-57 project owned by another Block 57 admin, with a warning", async () => {
    const first = await runSeed();
    const siteId = await getSiteId();
    const other = await User.create({
      siteId,
      email: "previous-sales@block57.test",
      passwordHash: await bcrypt.hash("Previous-Pass-1", 4),
      role: "admin",
    });
    await Project.updateOne({ _id: first.project.id }, { ownerId: other._id });

    const summary = await runSeed({ units: [unit()] });
    expect(summary.warnings).toEqual([
      "The project is owned by another block57 admin (previous-sales@block57.test); units are created under that account",
    ]);
    const [created] = await Property.find({ siteId });
    expect(String(created.ownerId)).toBe(String(other._id));
  });

  it("stops instead of creating a duplicate project after the project is renamed", async () => {
    const first = await runSeed({ unitsFile: EXAMPLE_UNITS_FILE });
    const siteId = await getSiteId();
    const app = await getApp();
    const login = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const auth = { Authorization: `Bearer ${login.body.data.accessToken}` };

    const renamed = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/projects/${first.project.id}`)
      .set(auth)
      .send({ title: "Block 57 Cantonments" });
    expect(renamed.status, renamed.body?.message).toBe(200);
    expect(renamed.body.data.slug).toBe("block-57-cantonments");

    await expect(runSeed({ unitsFile: EXAMPLE_UNITS_FILE })).rejects.toThrow(
      'No project has the slug "block-57", but block57 admins already own "Block 57 Cantonments" (/block-57-cantonments). ' +
        "The Block 57 project was probably renamed in the dashboard (a new title changes the slug). " +
        'Rename it back to "Block 57" so its slug is "block-57" again (the website loads the project by that slug), then re-run.',
    );
    expect(await Project.countDocuments({ siteId })).toBe(1);
    expect(await Property.countDocuments({ siteId })).toBe(6);

    // Renaming it back restores the slug and the seed carries on.
    const restored = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/projects/${first.project.id}`)
      .set(auth)
      .send({ title: "Block 57" });
    expect(restored.body.data.slug).toBe(BLOCK57_PROJECT_SLUG);
    const rerun = await runSeed({ unitsFile: EXAMPLE_UNITS_FILE });
    expect(rerun.project).toMatchObject({ created: false });
    expect(rerun.units.unchanged).toBe(6);
  });

  it("applies sold transitions after new units, so one file can sell the last units and add more", async () => {
    await runSeed({
      units: [unit(), unit({ title: "A-102" })],
      activate: true,
    });

    // Sold entries come first in the file; applying them in file order would
    // turn the project sold before B-201 is created.
    const summary = await runSeed({
      units: [
        unit({ status: "sold" }),
        unit({ title: "A-102", status: "sold" }),
        unit({ title: "B-201", type: "two-bedroom", building: "B" }),
      ],
    });

    expect(summary.units).toMatchObject({ created: 1, updated: 2 });
    expect(summary.project).toMatchObject({
      status: "active",
      unitsByStatus: { pending: 1, sold: 2 },
    });
    const notifications = await Notification.find({
      title: "Project status: sold",
    });
    expect(notifications).toHaveLength(0);
  });

  it("refuses new units for a sold project before writing anything", async () => {
    await runSeed({ units: [unit()], activate: true });
    await runSeed({ units: [unit({ status: "sold" })] });
    const siteId = await getSiteId();
    expect(
      (await Project.findOne({ siteId, slug: BLOCK57_PROJECT_SLUG })).status,
    ).toBe("sold");

    await expect(
      runSeed({
        units: [
          unit({ status: "sold", price: 999000 }),
          unit({ title: "C-301", type: "penthouse", building: "C" }),
        ],
      }),
    ).rejects.toThrow(
      "The project is sold (every unit is sold), so it cannot accept the 1 new unit(s) in the file (C-301). Nothing was written.",
    );
    const units = await unitsByTitle(siteId);
    expect(units.size).toBe(1);
    expect(units.get("A-101").price).toBe(150000);
  });

  it("reports every unit field the file overwrites after a dashboard edit", async () => {
    await runSeed({ units: [unit()], activate: true });
    const siteId = await getSiteId();
    // Sales staff edit the unit in the dashboard.
    await Property.updateOne(
      { siteId, title: "A-101" },
      { price: 165000, description: "Edited in the dashboard." },
    );

    const summary = await runSeed({
      units: [unit({ description: "Executive Studio from the file." })],
    });
    expect(summary.units).toMatchObject({ updated: 1 });
    expect(summary.units.changes).toEqual([
      "A-101 price: 165000 -> 150000",
      "A-101 description: replaced",
    ]);
  });
});
