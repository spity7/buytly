import { Project } from "./project.model.js";
import { Property } from "../properties/property.model.js";

/** Project statuses that require at least one live unit to stay public. */
const STATUSES_REQUIRING_LIVE_UNITS = new Set(["active", "pending"]);

/**
 * When the last non-trashed unit is removed, pull the project back to draft so
 * an active/pending shell is not shown without a sellable listing.
 */
export const maybeDemoteProjectWithoutLiveUnits = async (projectId) => {
  const project = await Project.findOne({
    _id: projectId,
    deletedAt: null,
  }).select("status title");

  if (!project || !STATUSES_REQUIRING_LIVE_UNITS.has(project.status)) {
    return { demoted: false };
  }

  const liveUnitCount = await Property.countDocuments({
    projectId: project._id,
    deletedAt: null,
  });

  if (liveUnitCount > 0) {
    return { demoted: false };
  }

  const previousStatus = project.status;
  project.status = "draft";
  await project.save({ validateBeforeSave: false });

  return { demoted: true, previousStatus };
};
