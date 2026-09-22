import { AppError } from "../../shared/AppError.js";

/** Enforce single vs compound unit counts when publishing. */
export const assertPublishUnitCardinality = (kind, unitCount) => {
  if (kind === "single" && unitCount !== 1) {
    throw new AppError(
      "Single projects must contain exactly one unit before publishing",
      400,
    );
  }
  if (kind === "compound" && unitCount < 2) {
    throw new AppError(
      "Compound projects must contain at least two units before publishing",
      400,
    );
  }
};
