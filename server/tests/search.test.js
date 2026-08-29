import { describe, it, expect } from "vitest";
import { buildPropertyTextFilter, escapeRegex } from "../src/shared/search.js";

describe("search helpers", () => {
  it("escapes regex special characters", () => {
    expect(escapeRegex("a+b")).toBe("a\\+b");
  });

  it("builds a case-insensitive title/description filter", () => {
    const filter = buildPropertyTextFilter("Luxury");
    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0].title).toEqual(/Luxury/i);
    expect(filter.$or[1].description).toEqual(/Luxury/i);
  });

  it("returns null for blank search", () => {
    expect(buildPropertyTextFilter("   ")).toBeNull();
  });
});
