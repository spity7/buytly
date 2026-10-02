/**
 * Copy legacy flat GCS keys (avatars/, projects/, properties/) to sites/{slug}/...
 * and update MongoDB gcsKey fields. Run once after multi-site backfill.
 *
 *   npm run migrate:gcs-site-prefix:dry-run
 *   npm run migrate:gcs-site-prefix
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import { gcsService } from "../src/services/gcs.service.js";
import { resolveMigratedGcsKey } from "../src/services/gcs-key-migrate.js";

const dryRun = process.argv.includes("--dry-run");

function siteSlugById(sitesById, siteId) {
  if (!siteId) return null;
  return sitesById.get(String(siteId)) ?? null;
}

/** @returns {Map<string, { newKey: string, siteSlug: string }>} */
function collectMigrationMap({ users, properties, projects, sitesById }) {
  const migrations = new Map();
  const conflicts = [];

  const register = (gcsKey, siteId, source) => {
    if (!gcsKey) return;
    const siteSlug = siteSlugById(sitesById, siteId);
    if (!siteSlug) {
      conflicts.push({
        gcsKey,
        siteId,
        source,
        reason: "missing siteId or slug",
      });
      return;
    }
    const resolved = resolveMigratedGcsKey(gcsKey, siteSlug);
    if (resolved.action === "skip") return;
    if (resolved.action === "unknown") {
      conflicts.push({ gcsKey, siteId, source, reason: "unknown key prefix" });
      return;
    }
    const existing = migrations.get(gcsKey);
    if (existing && existing.newKey !== resolved.newKey) {
      conflicts.push({
        gcsKey,
        siteId,
        source,
        reason: `conflicting targets: ${existing.newKey} vs ${resolved.newKey}`,
      });
      return;
    }
    migrations.set(gcsKey, { newKey: resolved.newKey, siteSlug });
  };

  for (const user of users) {
    register(user.avatar?.gcsKey, user.siteId, `user:${user._id}`);
  }
  for (const property of properties) {
    for (const item of property.media || []) {
      register(item?.gcsKey, property.siteId, `property:${property._id}:media`);
    }
    for (const plan of property.floorPlans || []) {
      register(
        plan?.gcsKey,
        property.siteId,
        `property:${property._id}:floorPlans`,
      );
    }
  }
  for (const project of projects) {
    for (const item of project.media || []) {
      register(item?.gcsKey, project.siteId, `project:${project._id}:media`);
    }
  }

  return { migrations, conflicts };
}

async function updateMongoReferences(oldKey, newKey) {
  await User.updateMany(
    { "avatar.gcsKey": oldKey },
    { $set: { "avatar.gcsKey": newKey } },
  );
  await Property.updateMany(
    { "media.gcsKey": oldKey },
    { $set: { "media.$[elem].gcsKey": newKey } },
    { arrayFilters: [{ "elem.gcsKey": oldKey }] },
  );
  await Property.updateMany(
    { "floorPlans.gcsKey": oldKey },
    { $set: { "floorPlans.$[elem].gcsKey": newKey } },
    { arrayFilters: [{ "elem.gcsKey": oldKey }] },
  );
  await Project.updateMany(
    { "media.gcsKey": oldKey },
    { $set: { "media.$[elem].gcsKey": newKey } },
    { arrayFilters: [{ "elem.gcsKey": oldKey }] },
  );
}

async function migrateKey(oldKey, { newKey }) {
  const destExists = await gcsService.fileExists(newKey);
  const sourceExists = await gcsService.fileExists(oldKey);

  if (!destExists && sourceExists) {
    await gcsService.copyFile(oldKey, newKey);
  } else if (!destExists && !sourceExists) {
    console.warn(
      `[migrate-gcs-site-prefix] skip copy (missing object): ${oldKey}`,
    );
  }

  await updateMongoReferences(oldKey, newKey);

  if (sourceExists && oldKey !== newKey) {
    await gcsService.deleteFile(oldKey);
  }
}

async function main() {
  await connectDB();

  const sites = await Site.find({}, { slug: 1 }).lean();
  const sitesById = new Map(sites.map((s) => [String(s._id), s.slug]));

  const [users, properties, projects] = await Promise.all([
    User.find(
      { "avatar.gcsKey": { $exists: true, $ne: null } },
      { avatar: 1, siteId: 1 },
    ).lean(),
    Property.find({}, { media: 1, floorPlans: 1, siteId: 1 }).lean(),
    Project.find({}, { media: 1, siteId: 1 }).lean(),
  ]);

  const { migrations, conflicts } = collectMigrationMap({
    users,
    properties,
    projects,
    sitesById,
  });

  console.log(
    `[migrate-gcs-site-prefix] keys to migrate=${migrations.size} conflicts=${conflicts.length} dryRun=${dryRun}`,
  );

  if (conflicts.length) {
    conflicts.forEach((c) =>
      console.warn("[migrate-gcs-site-prefix] conflict:", c),
    );
  }

  let migrated = 0;
  let failed = 0;

  for (const [oldKey, target] of migrations) {
    if (dryRun) {
      console.log(
        `[migrate-gcs-site-prefix] would migrate ${oldKey} -> ${target.newKey}`,
      );
      migrated += 1;
      continue;
    }

    try {
      await migrateKey(oldKey, target);
      console.log(
        `[migrate-gcs-site-prefix] migrated ${oldKey} -> ${target.newKey}`,
      );
      migrated += 1;
    } catch (err) {
      failed += 1;
      console.error(
        `[migrate-gcs-site-prefix] failed ${oldKey} -> ${target.newKey}:`,
        err.message,
      );
    }
  }

  console.log(
    `[migrate-gcs-site-prefix] done migrated=${migrated} failed=${failed}`,
  );

  await disconnectDB();
}

main().catch(async (error) => {
  console.error("[migrate-gcs-site-prefix] failed:", error);
  if (mongoose.connection.readyState === 1) {
    await disconnectDB();
  }
  process.exit(1);
});
