import { Property } from "../properties/property.model.js";

const STATUSES_TO_DEMOTE = ["active", "pending"];

/**
 * When a project is returned to draft, pull review/live units back to draft so
 * sellers do not see "published" units under a draft parent.
 */
export const cascadeDemoteUnitsWhenProjectReturnedToDraft = async (
  projectId,
) => {
  await Property.updateMany(
    {
      projectId,
      deletedAt: null,
      status: { $in: STATUSES_TO_DEMOTE },
    },
    { $set: { status: "draft" } },
  );
};
