/**
 * Block 57 tenant bootstrap (npm run seed:block57). Safe to re-run: every step
 * is an upsert, existing dashboard edits are kept, and nothing is deleted.
 * CLI wrapper: scripts/seed-block57.js. Docs: docs/deployment.md.
 */
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import { z } from "zod";
import { isDBConnected } from "../../src/config/db.js";
import { User } from "../../src/modules/users/user.model.js";
import { RefreshToken } from "../../src/modules/auth/refreshToken.model.js";
import { passwordSchema } from "../../src/modules/auth/auth.validation.js";
import { Project } from "../../src/modules/projects/project.model.js";
import { projectService } from "../../src/modules/projects/project.service.js";
import { syncParentProjectSoldStatus } from "../../src/modules/projects/project-sold-sync.js";
import { Property } from "../../src/modules/properties/property.model.js";
import { propertyService } from "../../src/modules/properties/property.service.js";
import { createPropertySchema } from "../../src/modules/properties/property.validation.js";
import { PropertyTypeCatalog } from "../../src/modules/catalog/property-type.model.js";
import { AmenityCatalog } from "../../src/modules/catalog/amenity.model.js";
import { DEFAULT_AMENITIES } from "../../src/modules/catalog/catalog.defaults.js";
import { catalogService } from "../../src/modules/catalog/catalog.service.js";
import { adminService } from "../../src/modules/admin/admin.service.js";
import { Notification } from "../../src/modules/notifications/notification.model.js";
import { siteService } from "../../src/modules/sites/site.service.js";
import { SITE_SLUG } from "../../src/modules/sites/site.constants.js";
import { resolveSitePublicBaseUrl } from "../../src/modules/sites/sitePublicUrl.js";
import { PROPERTY_STATUSES, ROLES } from "../../src/shared/constants.js";
import { buildFullPhone, parseFullPhone } from "../../src/shared/phone.js";
import { runWithRequestContext } from "../../src/shared/requestContext.js";

/** Same bcrypt cost as auth.service.js. */
const SALT_ROUNDS = 12;

export const BLOCK57_PROJECT_SLUG = "block-57";
const BLOCK57_PROJECT_TITLE = "Block 57";

// First sentence is the brief's marketing copy; replace with the verbatim
// WordPress text in the dashboard once it is captured (Phase 0).
const BLOCK57_PROJECT_DESCRIPTION =
  "Block 57 was created to challenge conventional urban living by delivering homes that are intentional, refined and enduring. " +
  "Set in the heart of Cantonments, Accra, it brings Executive Studios, one- and two-bedroom apartments, townhouses, urban villas and penthouses together across Blocks A, B and C.";

// Approximate — confirm: First Circular Crescent, Cantonments. Override with
// BLOCK57_LAT / BLOCK57_LNG; only used when the project is first created.
export const BLOCK57_DEFAULT_COORDINATES = { lat: 5.5786, lng: -0.1745 };

const BLOCK57_PROJECT_LOCATION = {
  address: "54E First Circular Crescent, Cantonments",
  city: "Accra",
  country: "Ghana",
};

/** Unit types (values match the WordPress /apartments/<slug>/ URLs). */
export const BLOCK57_PROPERTY_TYPES = [
  { value: "executive-studio", label: "Executive Studio", sortOrder: 1 },
  { value: "one-bedroom", label: "1 Bedroom", sortOrder: 2 },
  { value: "two-bedroom", label: "2 Bedroom", sortOrder: 3 },
  { value: "townhouse", label: "Townhouse", sortOrder: 4 },
  { value: "urban-villa", label: "Urban Villa", sortOrder: 5 },
  { value: "penthouse", label: "Penthouse", sortOrder: 6 },
];

const defaultAmenity = (value) => {
  const entry = DEFAULT_AMENITIES.find((item) => item.value === value);
  if (!entry) throw new Error(`"${value}" is not a catalog default amenity`);
  return entry;
};

/**
 * Amenities kept active and stored on the project. Values follow the catalog
 * convention (value = display string, as in catalog.defaults.js) because
 * project pages render the stored value.
 */
export const BLOCK57_AMENITIES = [
  defaultAmenity("Swimming Pool"),
  defaultAmenity("Security"),
  { value: "Rooftop Lounge", label: "Rooftop Lounge", sortOrder: 16 },
  { value: "Padel Court", label: "Padel Court", sortOrder: 17 },
  { value: "Fitness Centre", label: "Fitness Centre", sortOrder: 18 },
  {
    value: "Children's Play Area",
    label: "Children's Play Area",
    sortOrder: 19,
  },
  { value: "Business Lounge", label: "Business Lounge", sortOrder: 20 },
  { value: "Underground Parking", label: "Underground Parking", sortOrder: 21 },
];

/** Catalog defaults that do not describe the development. */
export const BLOCK57_DEACTIVATED_AMENITIES = [
  defaultAmenity("Sea View"),
  defaultAmenity("Mountain View"),
  defaultAmenity("Generator"),
];

const ADMIN_PROFILE_DEFAULTS = { firstName: "Block 57", lastName: "Sales" };

const UNIT_INPUT_STATUSES = ["pending", "sold"];

/** One entry of the --units JSON file; field rules come from the property API. */
const unitInputSchema = createPropertySchema
  .pick({
    title: true,
    type: true,
    price: true,
    bedrooms: true,
    bathrooms: true,
    area: true,
    building: true,
    floor: true,
    sortOrder: true,
  })
  .extend({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).optional(),
    status: z.enum(UNIT_INPUT_STATUSES).default("pending"),
  })
  .strict();

const adminEmailSchema = z.string().trim().toLowerCase().email();

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const formatZodIssues = (error) =>
  error.issues
    .map((issue) =>
      issue.path.length
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message,
    )
    .join("; ");

/** Messages name the variable but never echo the password. */
function validateAdminInput({ adminEmail, adminPassword }) {
  const problems = [];
  const email = adminEmailSchema.safeParse(adminEmail);

  if (typeof adminEmail !== "string" || !adminEmail.trim()) {
    problems.push("BLOCK57_ADMIN_EMAIL is required");
  } else if (!email.success) {
    problems.push("BLOCK57_ADMIN_EMAIL must be a valid email address");
  }

  if (typeof adminPassword !== "string" || !adminPassword) {
    problems.push("BLOCK57_ADMIN_PASSWORD is required");
  } else if (!passwordSchema.safeParse(adminPassword).success) {
    problems.push("BLOCK57_ADMIN_PASSWORD must be 8-128 characters");
  }

  if (problems.length) throw new Error(problems.join("; "));
  return { adminEmail: email.data, adminPassword };
}

/** Validates the whole file up front so a bad entry never half-applies. */
export function parseBlock57Units(rawUnits) {
  if (!Array.isArray(rawUnits)) {
    throw new Error("Units file must contain a JSON array of units");
  }

  const errors = [];
  const units = [];
  const seenTitles = new Set();

  rawUnits.forEach((raw, index) => {
    const label = `unit #${index + 1}${raw?.title ? ` ("${raw.title}")` : ""}`;
    const result = unitInputSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`${label}: ${formatZodIssues(result.error)}`);
      return;
    }
    if (seenTitles.has(result.data.title)) {
      errors.push(`${label}: duplicate title in file`);
      return;
    }
    seenTitles.add(result.data.title);
    units.push(result.data);
  });

  if (errors.length) {
    throw new Error(`Invalid units file:\n  - ${errors.join("\n  - ")}`);
  }
  return units;
}

async function loadUnits({ units, unitsFile }) {
  if (units) return parseBlock57Units(units);
  if (!unitsFile) return null;

  let raw;
  try {
    raw = JSON.parse(await fs.readFile(unitsFile, "utf8"));
  } catch (error) {
    throw new Error(`Could not read units file ${unitsFile}: ${error.message}`);
  }
  return parseBlock57Units(raw);
}

async function ensureAdmin(site, { email, password, resetPassword }, warnings) {
  const user = await User.findOne({
    siteId: site._id,
    email,
    deletedAt: null,
  }).select("+passwordHash");

  if (!user) {
    const { phoneCountryCode, phoneNumber } = parseFullPhone(
      site.branding?.supportPhone,
    );
    const created = await User.create({
      siteId: site._id,
      email,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      authProvider: "local",
      role: ROLES.ADMIN,
      platformPermissions: [],
      ...ADMIN_PROFILE_DEFAULTS,
      phoneCountryCode: phoneNumber ? phoneCountryCode : undefined,
      phoneNumber: phoneNumber || undefined,
      phone: buildFullPhone(phoneCountryCode, phoneNumber),
      isEmailVerified: true,
      isActive: true,
    });
    return { user: created, created: true, changes: [], passwordReset: false };
  }

  const changes = [];
  if (user.role !== ROLES.ADMIN) {
    changes.push(`role ${user.role} -> admin`);
    user.role = ROLES.ADMIN;
  }
  if (!user.isEmailVerified) {
    changes.push("email marked verified");
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
  }
  if (user.platformPermissions?.length) {
    changes.push("platform permissions removed");
    user.platformPermissions = [];
  }

  // Same effect as a password reset: new hash, pending reset token cleared,
  // existing sessions revoked.
  if (resetPassword) {
    user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    if (user.authProvider === "google") user.authProvider = "both";
  }

  if (changes.length || resetPassword) await user.save();

  if (resetPassword) {
    await RefreshToken.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() },
    );
  } else if (!user.passwordHash) {
    warnings.push(
      `${email} has no password (Google sign-in only); pass --reset-admin-password to set one`,
    );
  }

  if (!user.isActive) {
    warnings.push(
      `${email} is deactivated and cannot sign in; reactivate it from another admin account`,
    );
  }

  return { user, created: false, changes, passwordReset: resetPassword };
}

// Existing rows are read first: updateOne always adds $set.updatedAt
// (timestamps), so a blind upsert would rewrite every row on each run.

/** Insert-only: labels, order and active flags edited later in the dashboard are kept. */
async function ensurePropertyTypes(siteId) {
  let created = 0;
  for (const entry of BLOCK57_PROPERTY_TYPES) {
    if (await PropertyTypeCatalog.exists({ siteId, value: entry.value })) {
      continue;
    }
    await PropertyTypeCatalog.updateOne(
      { siteId, value: entry.value },
      {
        $setOnInsert: {
          siteId,
          label: entry.label,
          sortOrder: entry.sortOrder,
          isActive: true,
        },
      },
      { upsert: true },
    );
    created += 1;
  }
  return { created, existing: BLOCK57_PROPERTY_TYPES.length - created };
}

/** Enforces isActive on every run; label/sortOrder are set only on insert. */
async function setAmenityActive(siteId, entry, isActive) {
  const existing = await AmenityCatalog.findOne({
    siteId,
    value: entry.value,
  }).select("isActive");

  if (existing) {
    if (existing.isActive === isActive) return "unchanged";
    existing.isActive = isActive;
    await existing.save();
    return "changed";
  }

  await AmenityCatalog.updateOne(
    { siteId, value: entry.value },
    {
      $setOnInsert: {
        siteId,
        label: entry.label,
        sortOrder: entry.sortOrder,
        isActive,
      },
    },
    { upsert: true },
  );
  return "created";
}

async function ensureAmenities(siteId) {
  // Same default rows the API inserts on the first catalog read.
  await catalogService.ensureDefaults(siteId);

  const summary = { created: 0, activated: 0, deactivated: 0 };
  for (const entry of BLOCK57_AMENITIES) {
    const outcome = await setAmenityActive(siteId, entry, true);
    if (outcome === "created") summary.created += 1;
    if (outcome === "changed") summary.activated += 1;
  }
  for (const entry of BLOCK57_DEACTIVATED_AMENITIES) {
    const outcome = await setAmenityActive(siteId, entry, false);
    if (outcome !== "unchanged") summary.deactivated += 1;
  }
  return summary;
}

/** Creates the project once; an existing project's content and status are never changed. */
async function ensureProject(site, admin, coordinates, warnings) {
  const existing = await Project.findOne({
    siteId: site._id,
    slug: BLOCK57_PROJECT_SLUG,
  });

  if (existing) {
    if (existing.deletedAt) {
      throw new Error(
        `The "${BLOCK57_PROJECT_SLUG}" project is in the trash (status ${existing.status}). Restore it from the dashboard, then re-run.`,
      );
    }
    if (!existing.ownerId.equals(admin._id)) {
      warnings.push(
        "The project is owned by another account; units are created under the project owner",
      );
    }
    return { project: existing, created: false };
  }

  await projectService.create(
    {
      title: BLOCK57_PROJECT_TITLE,
      description: BLOCK57_PROJECT_DESCRIPTION,
      location: {
        coordinates: [coordinates.lng, coordinates.lat],
        ...BLOCK57_PROJECT_LOCATION,
      },
      amenities: BLOCK57_AMENITIES.map((entry) => entry.value),
      status: "draft",
    },
    admin,
  );

  const project = await Project.findOne({
    siteId: site._id,
    slug: BLOCK57_PROJECT_SLUG,
  });
  if (!project) {
    throw new Error(
      `Project was created without the "${BLOCK57_PROJECT_SLUG}" slug`,
    );
  }
  return { project, created: true };
}

/** e.g. "2 Bedroom residence in Block C, floor 7, at Block 57, Cantonments, Accra." */
function defaultUnitDescription({ building, floor }, typeLabel) {
  const parts = [];
  if (building) {
    parts.push(/^block\b/i.test(building) ? building : `Block ${building}`);
  }
  if (floor !== undefined && floor !== null) {
    parts.push(floor === 0 ? "ground floor" : `floor ${floor}`);
  }
  const position = parts.join(", ");
  return `${typeLabel} residence${position ? ` in ${position},` : ""} at Block 57, Cantonments, Accra.`;
}

const OPTIONAL_UNIT_FIELDS = [
  "description",
  "bedrooms",
  "bathrooms",
  "area",
  "sortOrder",
];

/** Fields of `unit` that differ from `existing` (undefined in the file = keep). */
function buildUnitPatch(existing, unit, warnings) {
  const patch = {};

  if (unit.type !== existing.type) patch.type = unit.type;
  if (unit.price !== existing.price) patch.price = unit.price;

  for (const field of OPTIONAL_UNIT_FIELDS) {
    if (unit[field] !== undefined && unit[field] !== existing[field]) {
      patch[field] = unit[field];
    }
  }

  // null (or "" for building) clears the value, matching the API.
  if (unit.building !== undefined) {
    const next = unit.building || undefined;
    if (next !== (existing.building || undefined)) {
      patch.building = next ?? null;
    }
  }
  if (unit.floor !== undefined) {
    const next = unit.floor ?? undefined;
    if (next !== (existing.floor ?? undefined)) patch.floor = next ?? null;
  }

  // Status only moves forward: never out of sold, never active -> pending.
  if (unit.status === "sold" && existing.status !== "sold") {
    patch.status = "sold";
  } else if (unit.status === "pending") {
    if (existing.status === "draft") patch.status = "pending";
    if (existing.status === "sold") {
      warnings.push(
        `Unit "${existing.title}" is sold in the database; kept as sold`,
      );
    }
  }

  return patch;
}

async function upsertUnits(site, project, admin, units, warnings) {
  const activeTypes = await PropertyTypeCatalog.find({
    siteId: site._id,
    isActive: true,
  }).select("value label");
  const typeLabels = new Map(activeTypes.map((row) => [row.value, row.label]));

  const unknownTypes = [
    ...new Set(
      units.map((unit) => unit.type).filter((type) => !typeLabels.has(type)),
    ),
  ];
  if (unknownTypes.length) {
    throw new Error(
      `Units use unknown or inactive property types: ${unknownTypes.join(", ")}`,
    );
  }

  const summary = { created: 0, updated: 0, unchanged: 0, skipped: 0 };
  let markedSold = false;

  for (const unit of units) {
    const matches = await Property.find({
      siteId: site._id,
      projectId: project._id,
      title: unit.title,
    }).select(
      "title type price description bedrooms bathrooms area sortOrder building floor status deletedAt",
    );

    if (matches.length > 1) {
      warnings.push(
        `Unit "${unit.title}" exists ${matches.length} times on the project; skipped`,
      );
      summary.skipped += 1;
      continue;
    }

    const [existing] = matches;
    try {
      if (!existing) {
        await propertyService.create(
          {
            ...unit,
            description:
              unit.description ??
              defaultUnitDescription(unit, typeLabels.get(unit.type)),
            projectId: project._id,
          },
          admin,
        );
        summary.created += 1;
        if (unit.status === "sold") markedSold = true;
        continue;
      }

      if (existing.deletedAt) {
        warnings.push(
          `Unit "${unit.title}" is in the trash; skipped (restore it from the dashboard)`,
        );
        summary.skipped += 1;
        continue;
      }

      const patch = buildUnitPatch(existing, unit, warnings);
      if (!Object.keys(patch).length) {
        summary.unchanged += 1;
        continue;
      }
      await propertyService.update(existing._id, patch, admin);
      summary.updated += 1;
    } catch (error) {
      throw new Error(`Unit "${unit.title}": ${error.message}`);
    }
  }

  // Created-as-sold units skip the update path's sync; mirror it once here.
  if (markedSold) {
    await syncParentProjectSoldStatus(project._id, { notify: true });
  }

  return summary;
}

/** Live (non-trashed) units of the project, e.g. { pending: 5, sold: 1 }. */
async function countUnitsByStatus(projectId) {
  const rows = await Property.aggregate([
    { $match: { projectId, deletedAt: null } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(
    rows
      .sort(
        (a, b) =>
          PROPERTY_STATUSES.indexOf(a._id) - PROPERTY_STATUSES.indexOf(b._id),
      )
      .map((row) => [row._id, row.count]),
  );
}

/** moderateProject notifies the owner without awaiting; let that write land before callers disconnect. */
async function waitForOwnerNotification(ownerId, since, timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (
      await Notification.exists({ userId: ownerId, createdAt: { $gte: since } })
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/** Same path as an admin approving the project: project -> active, pending units -> active. */
async function activateProject(projectId, admin) {
  const project = await Project.findById(projectId);
  const statusBefore = project.status;

  if (statusBefore === "sold") {
    return {
      activated: false,
      statusBefore,
      unitsActivated: 0,
      reason: "every unit is sold, so the project is sold",
    };
  }

  const counts = await countUnitsByStatus(project._id);
  const pending = counts.pending ?? 0;
  const draft = counts.draft ?? 0;

  if (pending + (counts.active ?? 0) === 0) {
    return {
      activated: false,
      statusBefore,
      unitsActivated: 0,
      reason: "the project needs at least one pending or active unit",
    };
  }
  if (statusBefore === "active" && pending === 0) {
    return {
      activated: false,
      statusBefore,
      unitsActivated: 0,
      draftUnits: draft,
      reason: "already active with no pending units",
    };
  }

  const since = new Date();
  await adminService.moderateProject(project._id, "active", admin);
  await waitForOwnerNotification(project.ownerId, since);

  return {
    activated: true,
    statusBefore,
    unitsActivated: pending,
    draftUnits: draft,
  };
}

/**
 * Bootstraps the Block 57 tenant. Requires an open MongoDB connection.
 *
 * @param {object} options
 * @param {string} options.adminEmail - BLOCK57_ADMIN_EMAIL
 * @param {string} options.adminPassword - BLOCK57_ADMIN_PASSWORD (never logged)
 * @param {boolean} [options.resetAdminPassword] - overwrite an existing admin's password
 * @param {string} [options.unitsFile] - path to a units JSON array
 * @param {object[]} [options.units] - units array (instead of unitsFile)
 * @param {boolean} [options.activate] - approve the project and its pending units
 * @param {{lat:number,lng:number}} [options.coordinates] - project location on first insert
 * @param {(message:string)=>void} [options.log]
 */
export async function seedBlock57({
  adminEmail,
  adminPassword,
  resetAdminPassword = false,
  unitsFile,
  units: unitsInput,
  activate = false,
  coordinates = BLOCK57_DEFAULT_COORDINATES,
  log = console.log,
} = {}) {
  const adminInput = validateAdminInput({ adminEmail, adminPassword });
  const coordinatesResult = coordinatesSchema.safeParse(coordinates);
  if (!coordinatesResult.success) {
    throw new Error(
      `Invalid coordinates: ${formatZodIssues(coordinatesResult.error)}`,
    );
  }
  const units = await loadUnits({ units: unitsInput, unitsFile });

  if (!isDBConnected()) {
    throw new Error("MongoDB is not connected");
  }

  log("[seed:block57] Ensuring sites...");
  await siteService.ensureDefaultSites();
  const site = await siteService.getBySlug(SITE_SLUG.BLOCK57);
  const warnings = [];

  // Services read the tenant from the request context, as in an API request.
  return runWithRequestContext({ site }, async () => {
    log("[seed:block57] Ensuring admin account...");
    const admin = await ensureAdmin(
      site,
      {
        email: adminInput.adminEmail,
        password: adminInput.adminPassword,
        resetPassword: resetAdminPassword,
      },
      warnings,
    );

    log("[seed:block57] Ensuring property types and amenities...");
    const propertyTypes = await ensurePropertyTypes(site._id);
    const amenities = await ensureAmenities(site._id);

    log("[seed:block57] Ensuring project...");
    const { project, created: projectCreated } = await ensureProject(
      site,
      admin.user,
      coordinatesResult.data,
      warnings,
    );

    let unitSummary = null;
    if (units) {
      log(`[seed:block57] Upserting ${units.length} unit(s)...`);
      unitSummary = {
        inFile: units.length,
        ...(await upsertUnits(site, project, admin.user, units, warnings)),
      };
    }

    let activation = null;
    if (activate) {
      log("[seed:block57] Activating project...");
      activation = await activateProject(project._id, admin.user);
    }

    const finalProject = await Project.findById(project._id).select("status");

    return {
      site: {
        id: site._id,
        slug: site.slug,
        publicUrl: resolveSitePublicBaseUrl(site),
      },
      admin: {
        id: admin.user._id,
        email: admin.user.email,
        created: admin.created,
        changes: admin.changes,
        passwordReset: admin.passwordReset,
      },
      propertyTypes,
      amenities,
      project: {
        id: project._id,
        slug: BLOCK57_PROJECT_SLUG,
        created: projectCreated,
        status: finalProject.status,
        unitsByStatus: await countUnitsByStatus(project._id),
      },
      units: unitSummary,
      activation,
      warnings,
    };
  });
}

/** Resolves a CLI path against the directory npm was started from. */
export function resolveUnitsPath(
  file,
  baseDir = process.env.INIT_CWD || process.cwd(),
) {
  return path.resolve(baseDir, file);
}
