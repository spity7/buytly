import { describe, it, expect } from "vitest";
import {
  collectReferencedGcsKeys,
  findOrphanObjectKeys,
  isOlderThanGrace,
} from "../src/services/gcs-orphan.service.js";

describe("gcs-orphan.service", () => {
  it("collectReferencedGcsKeys gathers avatar, listing, and project media keys", () => {
    const keys = collectReferencedGcsKeys({
      users: [{ avatar: { gcsKey: "avatars/u1.jpg" } }],
      properties: [
        {
          media: [{ gcsKey: "properties/p1.jpg" }],
          floorPlans: [{ gcsKey: "properties/floor-plans/fp1.jpg" }],
        },
      ],
      projects: [{ media: [{ gcsKey: "projects/pr1.jpg" }] }],
    });

    expect([...keys]).toEqual([
      "avatars/u1.jpg",
      "properties/p1.jpg",
      "properties/floor-plans/fp1.jpg",
      "projects/pr1.jpg",
    ]);
  });

  it("isOlderThanGrace respects the grace window", () => {
    const now = Date.parse("2026-01-10T12:00:00.000Z");
    const recent = "2026-01-10T10:00:00.000Z";
    const old = "2026-01-08T10:00:00.000Z";

    expect(isOlderThanGrace(recent, 48, now)).toBe(false);
    expect(isOlderThanGrace(old, 48, now)).toBe(true);
    expect(isOlderThanGrace(null, 48, now)).toBe(true);
  });

  it("findOrphanObjectKeys returns unreferenced objects past grace period", () => {
    const now = Date.parse("2026-01-10T12:00:00.000Z");
    const referenced = new Set(["properties/keep.jpg"]);

    const orphans = findOrphanObjectKeys({
      referencedKeys: referenced,
      graceHours: 48,
      now,
      bucketObjects: [
        {
          name: "properties/keep.jpg",
          timeCreated: "2026-01-01T00:00:00.000Z",
        },
        {
          name: "properties/stale.jpg",
          timeCreated: "2026-01-01T00:00:00.000Z",
        },
        {
          name: "properties/fresh.jpg",
          timeCreated: "2026-01-10T11:00:00.000Z",
        },
        { name: "other/prefix.jpg", timeCreated: "2026-01-01T00:00:00.000Z" },
      ],
    });

    expect(orphans).toEqual(["properties/stale.jpg"]);
  });

  it("findOrphanObjectKeys handles sites/{slug}/ prefixed objects", () => {
    const now = Date.parse("2026-01-10T12:00:00.000Z");
    const referenced = new Set(["sites/buytly/properties/keep.jpg"]);

    const orphans = findOrphanObjectKeys({
      referencedKeys: referenced,
      graceHours: 48,
      now,
      bucketObjects: [
        {
          name: "sites/buytly/properties/keep.jpg",
          timeCreated: "2026-01-01T00:00:00.000Z",
        },
        {
          name: "sites/buytly/projects/stale.jpg",
          timeCreated: "2026-01-01T00:00:00.000Z",
        },
        {
          name: "sites/buildwise/avatars/old.jpg",
          timeCreated: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(orphans).toEqual([
      "sites/buytly/projects/stale.jpg",
      "sites/buildwise/avatars/old.jpg",
    ]);
  });
});
