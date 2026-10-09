import { Project } from "./project.model.js";
import { Property } from "../properties/property.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { AppError } from "../../shared/AppError.js";

/** Parent projects that can transition to sold after unit sales. */
const PROJECT_SELLABLE_STATUSES = ["active"];

export const assertCanMarkProjectSold = (project) => {
  if (!project || project.deletedAt) {
    throw new AppError("Project not found", 404);
  }
  if (project.status !== "active") {
    throw new AppError("Only published projects can be marked sold", 400);
  }
};

/**
 * Mark a project and all non-trashed units as sold (manual dashboard action).
 */
export const cascadeMarkProjectAndUnitsSold = async (
  projectId,
  { notify = false } = {},
) => {
  const project = await Project.findOne({
    _id: projectId,
    deletedAt: null,
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.status === "archived") {
    throw new AppError("Archived projects cannot be marked sold", 400);
  }

  await Property.updateMany(
    { projectId: project._id, deletedAt: null },
    { $set: { status: "sold" } },
  );

  if (project.status !== "sold") {
    project.status = "sold";
    await project.save();
  }

  if (notify) {
    await notifyProjectMarkedSold(project);
  }

  return { project };
};

export const shouldMarkProjectSold = (units) => {
  if (!units?.length) {
    return false;
  }
  return units.every((unit) => unit.status === "sold");
};

const notifyProjectMarkedSold = async (project) => {
  const owner = await Project.findById(project._id)
    .populate("ownerId", "firstName lastName email")
    .select("ownerId title");

  if (!owner?.ownerId) {
    return;
  }

  await notificationService
    .notifyFromEvent("project.status_changed", {
      userId: owner.ownerId._id,
      context: {
        projectId: project._id,
        projectTitle: project.title,
        status: "sold",
        message: "Your project has been marked as sold.",
        name: owner.ownerId.firstName || owner.ownerId.email,
      },
    })
    .catch((err) =>
      console.error("Project sold notification failed:", err.message),
    );
};

/**
 * After a unit is marked sold, set the parent project to sold when every
 * non-trashed unit on the project is sold.
 */
export const syncParentProjectSoldStatus = async (
  projectId,
  { notify = false } = {},
) => {
  const project = await Project.findOne({
    _id: projectId,
    deletedAt: null,
  }).select("status title ownerId");

  if (!project || !PROJECT_SELLABLE_STATUSES.includes(project.status)) {
    return { projectSold: false };
  }

  const units = await Property.find({
    projectId: project._id,
    deletedAt: null,
  }).select("status");

  if (!shouldMarkProjectSold(units)) {
    return { projectSold: false };
  }

  project.status = "sold";
  await project.save();

  if (notify) {
    await notifyProjectMarkedSold(project);
  }

  return { projectSold: true, project };
};
