import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { User } from "../src/modules/users/user.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { gcsService } from "../src/services/gcs.service.js";

const GRACE_HOURS = Number(process.env.GCS_ORPHAN_GRACE_HOURS || 48);
const PREFIXES = ["avatars/", "properties/"];
const dryRun = process.argv.includes("--dry-run");

async function collectReferencedKeys() {
  const keys = new Set();

  const users = await User.find(
    { "avatar.gcsKey": { $exists: true, $ne: null } },
    { avatar: 1 },
  ).lean();

  for (const user of users) {
    if (user.avatar?.gcsKey) keys.add(user.avatar.gcsKey);
  }

  const properties = await Property.find(
    {},
    { media: 1, floorPlans: 1 },
  ).lean();

  for (const property of properties) {
    for (const item of property.media || []) {
      if (item?.gcsKey) keys.add(item.gcsKey);
    }
    for (const plan of property.floorPlans || []) {
      if (plan?.gcsKey) keys.add(plan.gcsKey);
    }
  }

  return keys;
}

function isOlderThanGrace(timeCreated) {
  if (!timeCreated) return true;
  const createdAt = new Date(timeCreated).getTime();
  const cutoff = Date.now() - GRACE_HOURS * 60 * 60 * 1000;
  return createdAt <= cutoff;
}

async function main() {
  await connectDB();

  const referenced = await collectReferencedKeys();
  const orphans = [];

  for (const prefix of PREFIXES) {
    const objects = await gcsService.listObjects(prefix);
    for (const object of objects) {
      if (referenced.has(object.name)) continue;
      if (!isOlderThanGrace(object.timeCreated)) continue;
      orphans.push(object.name);
    }
  }

  console.log(
    `[gcs-orphan-cleanup] referenced=${referenced.size} orphans=${orphans.length} dryRun=${dryRun}`,
  );

  if (!dryRun) {
    for (const key of orphans) {
      await gcsService.deleteFile(key);
      console.log(`[gcs-orphan-cleanup] deleted ${key}`);
    }
  } else {
    orphans.forEach((key) => console.log(`[gcs-orphan-cleanup] would delete ${key}`));
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
