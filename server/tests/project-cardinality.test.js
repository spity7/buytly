import { describe, it, expect } from "vitest";
import {
  assertParentProjectAllowsUnitStatus,
  assertProjectKindChange,
  assertPublishUnitCardinality,
  getPublishUnitRules,
  isPublishUnitCountValid,
} from "../src/modules/projects/project-cardinality.js";
import { AppError } from "../src/shared/AppError.js";

describe("project-cardinality", () => {
  it("getPublishUnitRules returns single and compound bounds", () => {
    expect(getPublishUnitRules("single")).toEqual({
      minUnits: 1,
      maxUnits: 1,
    });
    expect(getPublishUnitRules("compound")).toEqual({
      minUnits: 1,
      maxUnits: null,
    });
  });

  it("isPublishUnitCountValid matches publish rules", () => {
    expect(isPublishUnitCountValid("single", 1)).toBe(true);
    expect(isPublishUnitCountValid("single", 0)).toBe(false);
    expect(isPublishUnitCountValid("single", 2)).toBe(false);
    expect(isPublishUnitCountValid("compound", 1)).toBe(true);
    expect(isPublishUnitCountValid("compound", 2)).toBe(true);
    expect(isPublishUnitCountValid("compound", 0)).toBe(false);
  });

  it("assertProjectKindChange allows draft with zero units", () => {
    const project = { kind: "compound", status: "draft" };
    expect(() => assertProjectKindChange(project, "single", 0)).not.toThrow();
  });

  it("assertProjectKindChange rejects when units exist", () => {
    const project = { kind: "compound", status: "draft" };
    expect(() => assertProjectKindChange(project, "single", 1)).toThrow(
      AppError,
    );
  });

  it("assertProjectKindChange rejects non-draft projects", () => {
    const project = { kind: "compound", status: "active" };
    expect(() => assertProjectKindChange(project, "single", 0)).toThrow(
      AppError,
    );
  });

  it("assertPublishUnitCardinality enforces single exact and compound minimum", () => {
    expect(() => assertPublishUnitCardinality("single", 2)).toThrow(AppError);
    expect(() => assertPublishUnitCardinality("compound", 0)).toThrow(AppError);
    expect(() => assertPublishUnitCardinality("compound", 1)).not.toThrow();
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
