import { describe, it, expect } from "vitest";
import { resolveMigratedGcsKey } from "../src/services/gcs-key-migrate.js";

describe("gcs-key-migrate", () => {
  it("skips keys already under sites/", () => {
    expect(
      resolveMigratedGcsKey("sites/buytly/properties/x.jpg", "buytly"),
    ).toEqual({ action: "skip" });
  });

  it("migrates legacy avatar keys", () => {
    expect(resolveMigratedGcsKey("avatars/u1.jpg", "buytly")).toEqual({
      action: "migrate",
      newKey: "sites/buytly/avatars/u1.jpg",
    });
  });

  it("migrates legacy project and property keys", () => {
    expect(resolveMigratedGcsKey("projects/pr1.jpg", "buildwise")).toEqual({
      action: "migrate",
      newKey: "sites/buildwise/projects/pr1.jpg",
    });
    expect(
      resolveMigratedGcsKey("properties/floor-plans/fp1.jpg", "buytly"),
    ).toEqual({
      action: "migrate",
      newKey: "sites/buytly/properties/floor-plans/fp1.jpg",
    });
  });

  it("returns unknown for unrecognized prefixes", () => {
    expect(resolveMigratedGcsKey("other/foo.jpg", "buytly")).toEqual({
      action: "unknown",
      gcsKey: "other/foo.jpg",
    });
  });
});
