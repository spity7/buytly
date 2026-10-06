#!/usr/bin/env node
/**
 * Block 57 tenant bootstrap. Safe to re-run.
 *
 *   BLOCK57_ADMIN_EMAIL=... BLOCK57_ADMIN_PASSWORD=... npm run seed:block57 -- \
 *     [--units <file.json>] [--activate] [--reset-admin-password]
 *
 * Docker: docker compose exec server npm run seed:block57 (see docs/deployment.md).
 */
import path from "node:path";
import { parseArgs } from "node:util";
import { connectDB, disconnectDB, isDBConnected } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import {
  BLOCK57_DEFAULT_COORDINATES,
  resolveUnitsPath,
  seedBlock57,
} from "./seed/block57.js";

const USAGE = `Usage: npm run seed:block57 -- [options]

Environment:
  BLOCK57_ADMIN_EMAIL       Admin account (shared sales mailbox; it owns the project)
  BLOCK57_ADMIN_PASSWORD    8-128 characters; only applied on create or with --reset-admin-password
  BLOCK57_LAT, BLOCK57_LNG  Optional project coordinates (set both; first insert only)

Options:
  --units <file>            Upsert units from a JSON array (see scripts/seed/block57-units.example.json)
  --activate                Approve the project and its pending units (needs a pending or active unit)
  --reset-admin-password    Overwrite an existing admin's password and sign out its sessions
  -h, --help                Show this help`;

function parseCoordinates() {
  const lat = process.env.BLOCK57_LAT?.trim();
  const lng = process.env.BLOCK57_LNG?.trim();
  if (!lat && !lng) return BLOCK57_DEFAULT_COORDINATES;
  if (!lat || !lng) {
    throw new Error("Set both BLOCK57_LAT and BLOCK57_LNG, or neither");
  }
  const coordinates = { lat: Number(lat), lng: Number(lng) };
  if (!Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) {
    throw new Error("BLOCK57_LAT and BLOCK57_LNG must be numbers");
  }
  return coordinates;
}

function printSummary(summary) {
  const { admin, propertyTypes, amenities, project, units, activation } =
    summary;
  const siteUrl = summary.site.publicUrl || env.APP_URL;
  const adminState = admin.created
    ? "created"
    : [
        "existing",
        ...admin.changes,
        admin.passwordReset ? "password reset" : "password unchanged",
      ].join(", ");
  const unitStatuses =
    Object.entries(project.unitsByStatus)
      .map(([status, count]) => `${count} ${status}`)
      .join(", ") || "no units";

  console.log("\nBlock 57 bootstrap complete\n");
  console.log(`  Site            ${summary.site.slug} (${siteUrl})`);
  console.log(`  Admin           ${admin.email} (${adminState})`);
  console.log(
    `  Property types  ${propertyTypes.created} created, ${propertyTypes.existing} already present`,
  );
  console.log(
    `  Amenities       ${amenities.created} created, ${amenities.activated} re-activated, ${amenities.deactivated} deactivated`,
  );
  console.log(
    `  Project         /${project.slug} (${project.created ? "created" : "existing"}), status ${project.status}; units: ${unitStatuses}`,
  );
  if (units) {
    console.log(
      `  Units file      ${units.inFile} entries: ${units.created} created, ${units.updated} updated, ${units.unchanged} unchanged, ${units.skipped} skipped`,
    );
  }
  if (activation) {
    console.log(
      activation.activated
        ? `  Activation      project ${activation.statusBefore} -> active, ${activation.unitsActivated} pending unit(s) now active${activation.draftUnits ? `, ${activation.draftUnits} draft unit(s) left as draft` : ""}`
        : `  Activation      skipped: ${activation.reason}`,
    );
  }

  if (summary.warnings.length) {
    console.log("\nWarnings:");
    for (const warning of summary.warnings) console.log(`  - ${warning}`);
  }

  const steps = [`Sign in at ${siteUrl}/login/ as ${admin.email}.`];
  if (!Object.keys(project.unitsByStatus).length) {
    steps.push(
      "Add units with --units <file.json> or from the dashboard (My projects).",
    );
  }
  if (project.status !== "active" && project.status !== "sold") {
    steps.push(
      "Review the units, then re-run with --activate (or approve the project in the admin dashboard).",
    );
  }
  steps.push(
    "Upload project and unit media and confirm the map pin in the dashboard.",
  );
  console.log("\nNext steps:");
  steps.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
  console.log("");
}

async function main() {
  const { values } = parseArgs({
    options: {
      units: { type: "string" },
      activate: { type: "boolean", default: false },
      "reset-admin-password": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    console.log(USAGE);
    return;
  }

  const unitsFile = values.units ? resolveUnitsPath(values.units) : undefined;
  if (
    unitsFile &&
    env.NODE_ENV === "production" &&
    path.basename(unitsFile).endsWith(".example.json")
  ) {
    throw new Error(
      "Refusing to import the example units file in production; pass the real inventory file",
    );
  }

  const coordinates = parseCoordinates();

  await connectDB();
  const summary = await seedBlock57({
    adminEmail: process.env.BLOCK57_ADMIN_EMAIL,
    adminPassword: process.env.BLOCK57_ADMIN_PASSWORD,
    resetAdminPassword: values["reset-admin-password"],
    unitsFile,
    activate: values.activate,
    coordinates,
  });
  printSummary(summary);
}

main()
  .catch((error) => {
    console.error(`[seed:block57] failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (isDBConnected()) await disconnectDB();
  });
