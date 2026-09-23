import { describe, it, expect } from "vitest";
import {
  assertParentProjectAllowsUnitRestore,
  assertParentProjectAllowsUnitStatus,
  assertPublishUnitCardinality,
  getPublishUnitRules,
  isPublishUnitCountValid,
} from "../src/modules/projects/project-cardinality.js";
import { AppError } from "../src/shared/AppError.js";

describe("project-cardinality", () => {
  it("getPublishUnitRules returns minimum one unit", () => {
    expect(getPublishUnitRules()).toEqual({
      minUnits: 1,
      maxUnits: null,
    });
  });

  it("isPublishUnitCountValid matches publish rules", () => {
    expect(isPublishUnitCountValid(1)).toBe(true);
    expect(isPublishUnitCountValid(2)).toBe(true);
    expect(isPublishUnitCountValid(0)).toBe(false);
  });

  it("assertPublishUnitCardinality enforces minimum unit count", () => {
    expect(() => assertPublishUnitCardinality(0)).toThrow(AppError);
    expect(() => assertPublishUnitCardinality(1)).not.toThrow();
    expect(() => assertPublishUnitCardinality(3)).not.toThrow();
  });

  it("assertParentProjectAllowsUnitRestore blocks when parent is trashed", () => {
    expect(() =>
      assertParentProjectAllowsUnitRestore({
        deletedAt: new Date(),
      }),
    ).toThrow(AppError);
  });

  it("assertParentProjectAllowsUnitRestore allows active parent", () => {
    expect(() =>
      assertParentProjectAllowsUnitRestore({ deletedAt: null }),
    ).not.toThrow();
  });

  it("assertParentProjectAllowsUnitStatus blocks admin activate when parent not live", () => {
    const project = { status: "pending", deletedAt: null };
    expect(() =>
      assertParentProjectAllowsUnitStatus(project, "active", { isAdmin: true }),
    ).toThrow(AppError);
  });

  it("assertParentProjectAllowsUnitStatus allows admin activate when parent active", () => {
    const project = { status: "active", deletedAt: null };
    expect(() =>
      assertParentProjectAllowsUnitStatus(project, "active", { isAdmin: true }),
    ).not.toThrow();
  });
});
