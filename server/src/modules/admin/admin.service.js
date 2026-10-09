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
import {
  buildPropertyTextFilter,
  escapeRegex,
} from "../../shared/search.js";
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
import {
  assertCanMarkProjectSold,
  cascadeMarkProjectAndUnitsSold,
  syncParentProjectSoldStatus,
} from "../projects/project-sold-sync.js";
import mongoose from "mongoose";
import { Site } from "../sites/site.model.js";
import { SITE_KIND } from "../sites/site.constants.js";
import {
  getRequestSite,
  getRequestSiteId,
} from "../../shared/requestContext.js";
import { ROLES } from "../../shared/constants.js";
import {
  assertCanSetVisibleOnPlatform,
  assertPlatformSiteAdmin,
  assertUnitPlatformVisibility,
} from "../platform/platform-visibility.js";
import { attachPropertyMediaUrls } from "../properties/property.service.js";
import { toInquiryResponse } from "../inquiries/inquiry-fields.js";
import { Inquiry } from "../inquiries/inquiry.model.js";

const INQUIRY_SEARCH_FIELDS = [
  "firstName",
  "lastName",
  "fullName",
  "email",
  "phone",
  "message",
];

const resolveListSiteId = (query, user) => {
  const requestSiteId = getRequestSiteId();
  if (query.siteId && isPlatformSiteAdminLister(user)) {
    return new mongoose.Types.ObjectId(query.siteId);
  }
  return requestSiteId;
};

const siteScope = (query, user, extra = {}) => ({
  siteId: resolveListSiteId(query, user),
  ...extra,
});

/** Buytly platform site — any admin may cross-list partner tenants. */
function isPlatformSiteAdminLister(user) {
  const site = getRequestSite();
  return site?.kind === SITE_KIND.PLATFORM && user?.role === ROLES.ADMIN;
}

async function buildAdminListSiteFilter(query, user) {
  const requestSiteId = getRequestSiteId();

  if (!isPlatformSiteAdminLister(user)) {
    return { siteId: requestSiteId };
  }

  if (query.siteId) {
    return { siteId: new mongoose.Types.ObjectId(query.siteId) };
  }

  const tenantIds = await Site.find({
    isActive: true,
    kind: SITE_KIND.TENANT,
  }).distinct("_id");

  return { siteId: { $in: [...tenantIds, requestSiteId] } };
}

async function findAdminProjectForModeration(projectId, actor) {
  if (isPlatformSiteAdminLister(actor)) {
    return Project.findOne({ _id: projectId });
  }
  const siteId = getRequestSiteId();
  return Project.findOne({ _id: projectId, siteId });
}

async function findAdminPropertyForModeration(propertyId, actor) {
  if (isPlatformSiteAdminLister(actor)) {
    return Property.findOne({ _id: propertyId });
  }
  const siteId = getRequestSiteId();
  return Property.findOne({ _id: propertyId, siteId });
}

export const adminService = {
  async listPartnerSites(user) {
    assertPlatformSiteAdmin(user);

    const sites = await Site.find({
      isActive: true,
      kind: SITE_KIND.TENANT,
    })
      .select("slug name kind")
      .sort({ name: 1 })
      .lean();

    return sites.map((site) => ({
      id: site._id,
      slug: site.slug,
      name: site.name,
    }));
  },

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
    const conditions = [await buildAdminListSiteFilter(query, user)];

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
    const existing = await findAdminPropertyForModeration(propertyId, actor);
    if (!existing) throw new AppError("Property not found", 404);

    let project;
    if (status !== "archived") {
      project = await Project.findOne({
        _id: existing.projectId,
        siteId: existing.siteId,
      });
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
    const conditions = [await buildAdminListSiteFilter(query, user)];

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
    const existing = await findAdminProjectForModeration(projectId, actor);
    if (!existing) throw new AppError("Project not found", 404);

    if (status === "active") {
      const unitCount = await Property.countDocuments({
        projectId: existing._id,
        deletedAt: null,
      });
      assertPublishUnitCardinality(unitCount);
    }

    if (status === "sold") {
      assertCanMarkProjectSold(existing);
      await cascadeMarkProjectAndUnitsSold(projectId, { notify: false });
      const project = await Project.findById(projectId).populate(
        "ownerId",
        "firstName lastName email",
      );
      if (!project) throw new AppError("Project not found", 404);

      notificationService
        .notifyFromEvent("project.status_changed", {
          userId: project.ownerId._id,
          context: {
            projectId: project._id,
            projectTitle: project.title,
            status: "sold",
            message: "Your project was marked as sold.",
            name: project.ownerId.firstName || project.ownerId.email,
          },
        })
        .catch((err) =>
          console.error("Project moderation notification failed:", err.message),
        );

      return project;
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

  async setPropertyPlatformFeatured(propertyId, visibleOnPlatform, actor) {
    assertPlatformSiteAdmin(actor);

    const property = await Property.findOne({
      _id: propertyId,
      deletedAt: null,
    });
    if (!property) throw new AppError("Property not found", 404);

    const listingSite = await Site.findById(property.siteId).lean();
    if (!listingSite || listingSite.kind !== SITE_KIND.TENANT) {
      throw new AppError("Only partner tenant listings can be featured", 400);
    }

    assertCanSetVisibleOnPlatform(property, visibleOnPlatform);

    if (visibleOnPlatform) {
      const project = await Project.findOne({
        _id: property.projectId,
        deletedAt: null,
      });
      if (!project) throw new AppError("Project not found", 404);
      assertUnitPlatformVisibility(project, true);
    }

    property.visibleOnPlatform = visibleOnPlatform;
    await property.save();
    return attachPropertyMediaUrls(property);
  },

  async setProjectPlatformFeatured(projectId, visibleOnPlatform, actor) {
    assertPlatformSiteAdmin(actor);

    const project = await Project.findOne({
      _id: projectId,
      deletedAt: null,
    });
    if (!project) throw new AppError("Project not found", 404);

    const listingSite = await Site.findById(project.siteId).lean();
    if (!listingSite || listingSite.kind !== SITE_KIND.TENANT) {
      throw new AppError("Only partner tenant projects can be featured", 400);
    }

    assertCanSetVisibleOnPlatform(project, visibleOnPlatform);
    project.visibleOnPlatform = visibleOnPlatform;
    await project.save();

    const doc = project.toObject();
    return doc;
  },

  /**
   * Inquiries are private to each site: always scoped to the request site,
   * with no platform-admin `siteId` override.
   */
  async listInquiries(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { siteId: getRequestSiteId() };

    if (query.status) filter.status = query.status;

    const term = query.search?.trim();
    if (term) {
      const pattern = new RegExp(escapeRegex(term), "i");
      filter.$or = INQUIRY_SEARCH_FIELDS.map((field) => ({ [field]: pattern }));
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return {
      inquiries: inquiries.map(toInquiryResponse),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async updateInquiryStatus(inquiryId, status) {
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: inquiryId, siteId: getRequestSiteId() },
      { status },
      { new: true, runValidators: true },
    ).lean();

    if (!inquiry) throw new AppError("Inquiry not found", 404);
    return toInquiryResponse(inquiry);
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
