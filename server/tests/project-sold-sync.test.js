import { describe, it, expect } from "vitest";
import { shouldMarkProjectSold } from "../src/modules/projects/project-sold-sync.js";

describe("project-sold-sync", () => {
  it("shouldMarkProjectSold is false with no units", () => {
    expect(shouldMarkProjectSold([])).toBe(false);
  });

  it("shouldMarkProjectSold is false when any unit is not sold", () => {
    expect(
      shouldMarkProjectSold([{ status: "sold" }, { status: "active" }]),
    ).toBe(false);
  });

  it("shouldMarkProjectSold is true when every unit is sold", () => {
    expect(
      shouldMarkProjectSold([{ status: "sold" }, { status: "sold" }]),
    ).toBe(true);
    expect(shouldMarkProjectSold([{ status: "sold" }])).toBe(true);
  });
});
