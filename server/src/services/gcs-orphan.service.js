export const GCS_ORPHAN_PREFIXES = ["avatars/", "properties/"];

export function collectReferencedGcsKeys({ users = [], properties = [] } = {}) {
  const keys = new Set();

  for (const user of users) {
    if (user?.avatar?.gcsKey) keys.add(user.avatar.gcsKey);
  }

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

export function isOlderThanGrace(timeCreated, graceHours, now = Date.now()) {
  if (!timeCreated) return true;
  const createdAt = new Date(timeCreated).getTime();
  const cutoff = now - graceHours * 60 * 60 * 1000;
  return createdAt <= cutoff;
}

export function findOrphanObjectKeys({
  bucketObjects = [],
  referencedKeys,
  graceHours = 48,
  now = Date.now(),
  prefixes = GCS_ORPHAN_PREFIXES,
}) {
  const referenced = referencedKeys instanceof Set ? referencedKeys : new Set(referencedKeys);
  const orphans = [];

  for (const prefix of prefixes) {
    for (const object of bucketObjects) {
      if (!object.name.startsWith(prefix)) continue;
      if (referenced.has(object.name)) continue;
      if (!isOlderThanGrace(object.timeCreated, graceHours, now)) continue;
      orphans.push(object.name);
    }
  }

  return orphans;
}
