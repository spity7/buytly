import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { gcsService } from "../src/services/gcs.service.js";
import {
  GCS_ORPHAN_PREFIXES,
  collectReferencedGcsKeys,
  findOrphanObjectKeys,
} from "../src/services/gcs-orphan.service.js";

const GRACE_HOURS = Number(process.env.GCS_ORPHAN_GRACE_HOURS || 48);
const dryRun = process.argv.includes("--dry-run");

async function loadReferencedKeys() {
  const [users, properties] = await Promise.all([
    User.find(
      { "avatar.gcsKey": { $exists: true, $ne: null } },
      { avatar: 1 },
    ).lean(),
    Property.find({}, { media: 1, floorPlans: 1 }).lean(),
  ]);

  return collectReferencedGcsKeys({ users, properties });
}

async function main() {
  await connectDB();

  const referenced = await loadReferencedKeys();
  const bucketObjects = (
    await Promise.all(GCS_ORPHAN_PREFIXES.map((prefix) => gcsService.listObjects(prefix)))
  ).flat();

  const orphans = findOrphanObjectKeys({
    bucketObjects,
    referencedKeys: referenced,
    graceHours: GRACE_HOURS,
  });

  console.log(
    `[gcs-orphan-cleanup] referenced=${referenced.size} orphans=${orphans.length} dryRun=${dryRun}`,
  );

  if (!dryRun) {
    for (const key of orphans) {
      await gcsService.deleteFile(key);
      console.log(`[gcs-orphan-cleanup] deleted ${key}`);
    }
  } else {
    orphans.forEach((key) =>
      console.log(`[gcs-orphan-cleanup] would delete ${key}`),
    );
  }

  await disconnectDB();
}

main().catch(async (error) => {
  console.error("[gcs-orphan-cleanup] failed:", error);
  if (mongoose.connection.readyState === 1) {
    await disconnectDB();
  }
  process.exit(1);
});
