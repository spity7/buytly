import { User } from "../users/user.model.js";
import { Property } from "../properties/property.model.js";
import { Project } from "../projects/project.model.js";
import { Booking } from "../bookings/booking.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { PropertyReview } from "../property-reviews/property-review.model.js";
import { Favorite } from "../favorites/favorite.model.js";
import {
  ANALYTICS_CACHE_KEY,
  cacheService,
} from "../../services/cache.service.js";
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
import { syncParentProjectSoldStatus } from "../projects/project-sold-sync.js";

export const adminService = {
  async listUsers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

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

  async getUserById(userId) {
    const user = await User.findById(userId).select("-passwordHash");
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
        $or: [{ ownerId: uid }, { agentId: uid }],
        deletedAt: null,
      }),
      Property.countDocuments({
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

  async updateUserStatus(userId, isActive) {
    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { isActive },
      { new: true },
    );

    if (!user) throw new AppError("User not found", 404);
    await cacheService.invalidateAnalytics();
    return user.toPublicJSON();
  },

  async updateUserRole(userId, role) {
    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { role },
      { new: true },
    );

    if (!user) throw new AppError("User not found", 404);
    await cacheService.invalidateAnalytics();
    return user.toPublicJSON();
  },

  async listProperties(query) {
    const { page, limit, skip } = parsePagination(query);
    const conditions = [];

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

  async moderateProperty(propertyId, status) {
    const existing = await Property.findById(propertyId);
    if (!existing) throw new AppError("Property not found", 404);

    if (status !== "archived") {
      const project = await Project.findById(existing.projectId);
      assertParentProjectAllowsUnitRestore(project);
      if (status === "active") {
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

    await cacheService.invalidateListingCaches();

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

  async listProjects(query) {
    const { page, limit, skip } = parsePagination(query);
    const conditions = [];

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

  async moderateProject(projectId, status) {
    const existing = await Project.findById(projectId);
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

    await cacheService.invalidateListingCaches();

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

  async getAnalytics() {
    const cacheKey = ANALYTICS_CACHE_KEY;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      usersByRole,
      listingsByType,
      bookingsThisMonth,
      transactionVolume,
      topCities,
    ] = await Promise.all([
      User.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: { type: "$type", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $count: "count" },
      ]),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Property.aggregate([
        { $match: { deletedAt: null, status: "active" } },
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

    await cacheService.set(cacheKey, analytics, 600);
    return analytics;
  },
};
