import { User } from "../users/user.model.js";
import { Property } from "../properties/property.model.js";
import { Project } from "../projects/project.model.js";
import { Booking } from "../bookings/booking.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { PropertyReview } from "../property-reviews/property-review.model.js";
import { Favorite } from "../favorites/favorite.model.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { buildPropertyTextFilter } from "../../shared/search.js";
import { notificationService } from "../notifications/notification.service.js";
import {
  buildArchiveUpdate,
  buildUnarchiveUpdate,
} from "../properties/property-status.js";
import {
  assertCanAddUnitToProject,
  assertParentProjectAllowsUnitRestore,
  assertParentProjectAllowsUnitStatus,
  assertPublishUnitCardinality,
} from "../projects/project-cardinality.js";
import { maybeDemoteProjectWithoutLiveUnits } from "../projects/project-live-units-sync.js";
import {
  cascadeRestoreProjectUnits,
  cascadeTrashProjectUnits,
} from "../projects/project-trash-cascade.js";
import { cascadeDemoteUnitsWhenProjectReturnedToDraft } from "../projects/project-draft-cascade.js";
import { syncParentProjectSoldStatus } from "../projects/project-sold-sync.js";
import mongoose from "mongoose";
import { getRequestSiteId } from "../../shared/requestContext.js";
import { isPlatformAdmin } from "../../shared/siteAccess.js";

const resolveListSiteId = (query, user) => {
  const requestSiteId = getRequestSiteId();
  if (query.siteId && isPlatformAdmin(user)) {
    return new mongoose.Types.ObjectId(query.siteId);
  }
  return requestSiteId;
};

const siteScope = (query, user, extra = {}) => ({
  siteId: resolveListSiteId(query, user),
  ...extra,
});

export const adminService = {
  async listUsers(query, user) {
    const { page, limit, skip } = parsePagination(query);
    const filter = siteScope(query, user);

    if (query.deleted === "true") {
      filter.deletedAt = { $ne: null };
    } else if (query.deleted !== "all") {
      filter.deletedAt = null;
    }

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined)
      filter.isActive = query.isActive === "true";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map((u) => u.toAdminJSON()),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getUserById(userId, actor) {
    const siteId = resolveListSiteId({}, actor);
    const user = await User.findOne({ _id: userId, siteId }).select(
      "-passwordHash",
    );
    if (!user) throw new AppError("User not found", 404);

    const uid = user._id;
    const [
      properties,
      activeListings,
      bookingsAsBuyer,
      bookingsAsAgent,
      transactions,
      reviews,
      favorites,
    ] = await Promise.all([
      Property.countDocuments({
        siteId,
        $or: [{ ownerId: uid }, { agentId: uid }],
        deletedAt: null,
      }),
      Property.countDocuments({
        siteId,
        $or: [{ ownerId: uid }, { agentId: uid }],
        deletedAt: null,
        status: "active",
      }),
      Booking.countDocuments({ buyerId: uid }),
      Booking.countDocuments({ agentId: uid }),
      Transaction.countDocuments({
        $or: [{ buyerId: uid }, { sellerId: uid }, { agentId: uid }],
      }),
      PropertyReview.countDocuments({ userId: uid }),
      Favorite.countDocuments({ userId: uid }),
    ]);

    return {
      user: user.toAdminJSON(),
      relatedCounts: {
        properties,
        activeListings,
        bookingsAsBuyer,
        bookingsAsAgent,
        transactions,
        reviews,
        favorites,
      },
    };
  },

  async updateUserStatus(userId, isActive, actor) {
    const siteId = resolveListSiteId({}, actor);
    const user = await User.findOneAndUpdate(
      { _id: userId, siteId, deletedAt: null },
      { isActive },
      { new: true },
    );

    if (!user) throw new AppError("User not found", 404);
    return user.toPublicJSON();
  },

  async updateUserRole(userId, role, actor) {
    const siteId = resolveListSiteId({}, actor);
    const user = await User.findOneAndUpdate(
      { _id: userId, siteId, deletedAt: null },
      { role },
      { new: true },
    );

    if (!user) throw new AppError("User not found", 404);
    return user.toPublicJSON();
  },

  async listProperties(query, user) {
    const { page, limit, skip } = parsePagination(query);
    const conditions = [siteScope(query, user)];

    if (query.status) conditions.push({ status: query.status });

    if (query.type) conditions.push({ type: query.type });

    const textFilter = buildPropertyTextFilter(query.search);
    if (textFilter) conditions.push(textFilter);

    const filter =
      conditions.length === 1 ? conditions[0] : { $and: conditions };

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("projectId", "title status deletedAt")
        .populate("ownerId", "firstName lastName email")
        .populate("agentId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    return { properties, pagination: buildPaginationMeta(total, page, limit) };
  },

  async moderateProperty(propertyId, status, actor) {
    const siteId = resolveListSiteId({}, actor);
    const existing = await Property.findOne({ _id: propertyId, siteId });
    if (!existing) throw new AppError("Property not found", 404);

    let project;
    if (status !== "archived") {
      project = await Project.findOne({ _id: existing.projectId, siteId });
      assertParentProjectAllowsUnitRestore(project);
      const unarchivingUnit = Boolean(existing.deletedAt);
      if (status === "active" && !unarchivingUnit) {
        assertParentProjectAllowsUnitStatus(project, status, { isAdmin: true });
      }
      if (existing.deletedAt) {
        assertCanAddUnitToProject(project);
      }
    }

    const update =
      status === "archived"
        ? buildArchiveUpdate()
        : buildUnarchiveUpdate(status);

    const property = await Property.findByIdAndUpdate(propertyId, update, {
      new: true,
    }).populate("ownerId", "firstName lastName email");

    if (!property) throw new AppError("Property not found", 404);

    if (status === "sold") {
      await syncParentProjectSoldStatus(existing.projectId, { notify: true });
    }

    if (status === "archived") {
      await maybeDemoteProjectWithoutLiveUnits(existing.projectId);
    }

    if (status === "active" && existing.deletedAt && project) {
      const liveUnitCount = await Property.countDocuments({
        projectId: existing.projectId,
        deletedAt: null,
      });
      if (
        liveUnitCount > 0 &&
        !project.deletedAt &&
        project.status === "draft"
      ) {
        await Project.findByIdAndUpdate(existing.projectId, {
          status: "active",
        });
      }
    }

    const statusMessages = {
      active: "Your listing has been approved and is now live.",
      draft: "Your listing was returned for edits.",
      archived: "Your listing has been archived.",
      pending: "Your listing is still under review.",
      sold: "Your listing was marked as sold.",
    };

    notificationService
      .notifyFromEvent("property.status_changed", {
        userId: property.ownerId._id,
        context: {
          propertyId: property._id,
          propertyTitle: property.title,
          status,
          message:
            statusMessages[status] ||
            `Your listing "${property.title}" is now ${status}.`,
          name: property.ownerId.firstName || property.ownerId.email,
        },
      })
      .catch((err) =>
        console.error("Property moderation notification failed:", err.message),
      );

    return property;
  },

  async listProjects(query, user) {
    const { page, limit, skip } = parsePagination(query);
    const conditions = [siteScope(query, user)];

    if (query.status) conditions.push({ status: query.status });
    const textFilter = buildPropertyTextFilter(query.search);
    if (textFilter) conditions.push(textFilter);

    const filter =
      conditions.length === 1 ? conditions[0] : { $and: conditions };

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("ownerId", "firstName lastName email")
        .populate("agentId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return { projects, pagination: buildPaginationMeta(total, page, limit) };
  },

  async moderateProject(projectId, status, actor) {
    const siteId = resolveListSiteId({}, actor);
    const existing = await Project.findOne({ _id: projectId, siteId });
    if (!existing) throw new AppError("Project not found", 404);

    if (status === "active") {
      const unitCount = await Property.countDocuments({
        projectId: existing._id,
        deletedAt: null,
      });
      assertPublishUnitCardinality(unitCount);
    }

    const cascadeDeletedAt = existing.deletedAt;
    let project;

    if (status === "archived") {
      const deletedAt = new Date();
      project = await Project.findByIdAndUpdate(
        projectId,
        { status: "archived", deletedAt },
        { new: true },
      ).populate("ownerId", "firstName lastName email");
      if (!project) throw new AppError("Project not found", 404);
      await cascadeTrashProjectUnits(project._id, deletedAt);
    } else {
      project = await Project.findByIdAndUpdate(
        projectId,
        buildUnarchiveUpdate(status),
        { new: true },
      ).populate("ownerId", "firstName lastName email");
      if (!project) throw new AppError("Project not found", 404);
      await cascadeRestoreProjectUnits(project._id, cascadeDeletedAt);
    }

    if (status === "active") {
      await Property.updateMany(
        { projectId: project._id, deletedAt: null, status: "pending" },
        { $set: { status: "active" } },
      );
    }

    if (status === "draft") {
      await cascadeDemoteUnitsWhenProjectReturnedToDraft(project._id);
    }

    const statusMessages = {
      active: "Your project has been approved and is now live.",
      draft: "Your project was returned for edits.",
      archived: "Your project has been archived.",
      pending: "Your project is still under review.",
      sold: "Your project was marked as sold.",
    };

    notificationService
      .notifyFromEvent("project.status_changed", {
        userId: project.ownerId._id,
        context: {
          projectId: project._id,
          projectTitle: project.title,
          status,
          message:
            statusMessages[status] ||
            `Your project "${project.title}" is now ${status}.`,
          name: project.ownerId.firstName || project.ownerId.email,
        },
      })
      .catch((err) =>
        console.error("Project moderation notification failed:", err.message),
      );

    return project;
  },

  async getAnalytics(query = {}, user) {
    const siteId = resolveListSiteId(query, user);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const siteMatch = { siteId };

    const [
      usersByRole,
      listingsByType,
      bookingsThisMonth,
      transactionVolume,
      topCities,
    ] = await Promise.all([
      User.aggregate([
        { $match: { ...siteMatch, deletedAt: null } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $match: { ...siteMatch, deletedAt: null } },
        {
          $group: {
            _id: { type: "$type", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        {
          $lookup: {
            from: "properties",
            localField: "propertyId",
            foreignField: "_id",
            as: "property",
          },
        },
        { $unwind: "$property" },
        {
          $match: {
            "property.siteId": siteId,
            createdAt: { $gte: startOfMonth },
          },
        },
        { $count: "count" },
      ]),
      Transaction.aggregate([
        {
          $lookup: {
            from: "properties",
            localField: "propertyId",
            foreignField: "_id",
            as: "property",
          },
        },
        { $unwind: "$property" },
        {
          $match: {
            "property.siteId": siteId,
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Property.aggregate([
        { $match: { ...siteMatch, deletedAt: null, status: "active" } },
        { $group: { _id: "$location.city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const analytics = {
      usersByRole,
      listingsByType,
      bookingsThisMonth: bookingsThisMonth[0]?.count || 0,
      transactionVolume,
      topCities,
    };

    return analytics;
  },
};
