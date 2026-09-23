import { describe, it, expect } from "vitest";
import { buildRestoreUpdate } from "../src/modules/properties/property-status.js";

describe("project-trash-cascade", () => {
  it("buildRestoreUpdate clears trash and resets status to draft", () => {
    expect(buildRestoreUpdate()).toEqual({
      status: "draft",
      deletedAt: null,
    });
  });
});
