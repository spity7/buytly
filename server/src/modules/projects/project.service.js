import { Project } from "./project.model.js";
import { Property } from "../properties/property.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { cacheService } from "../../services/cache.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { buildPropertyTextFilter } from "../../shared/search.js";
import { slugify } from "../../utils/slugify.js";
import { ROLES } from "../../shared/constants.js";
import { catalogService } from "../catalog/catalog.service.js";
import { User } from "../users/user.model.js";
import { notificationService } from "../notifications/notification.service.js";
import {
  normalizeSellerStatus,
  resolvePublicListStatus,
  hasMaterialChanges,
  buildArchiveUpdate,
  buildRestoreUpdate,
} from "../properties/property-status.js";
import { assertPublishUnitCardinality } from "./project-cardinality.js";

const EARTH_RADIUS_KM = 6378.1;

export const canManageProject = (project, user) =>
  Boolean(
    user &&
    (user.role === ROLES.ADMIN ||
      project.ownerId.equals(user._id) ||
      (project.agentId && project.agentId.equals(user._id))),
  );

const canViewNonActiveProject = (project, user) =>
  canManageProject(project, user);

const PUBLIC_UNIT_STATUSES = ["active", "sold"];

const buildUnitsQuery = (project, user) => {
  const filter = { projectId: project._id, deletedAt: null };
  if (!canManageProject(project, user)) {
    filter.status = { $in: PUBLIC_UNIT_STATUSES };
  }
  return filter;
};

const notifyAdminsOfPendingUnit = async (property, project) => {
  const admins = await User.find({
    role: ROLES.ADMIN,
    deletedAt: null,
    isActive: true,
  }).select("_id");

  await notificationService.notifyMany(
    "property.pending_review",
    admins.map((admin) => admin._id),
    {
      propertyId: property._id,
      propertyTitle: property.title,
      projectId: project._id,
      projectTitle: project.title,
    },
  );
};

const submitDraftUnitsForReview = async (project) => {
  const draftUnits = await Property.find({
    projectId: project._id,
    deletedAt: null,
    status: "draft",
  });

  for (const unit of draftUnits) {
    unit.status = "pending";
    await unit.save();
    await notifyAdminsOfPendingUnit(unit, project);
  }
};

const notifyAdminsOfPendingProject = async (project) => {
  const admins = await User.find({
    role: ROLES.ADMIN,
    deletedAt: null,
    isActive: true,
  }).select("_id");

  await notificationService.notifyMany(
    "project.pending_review",
    admins.map((admin) => admin._id),
    {
      projectId: project._id,
      projectTitle: project.title,
    },
  );
};

const attachMediaUrls = async (project) => {
  if (!project) return project;
  const doc = project.toObject ? project.toObject() : { ...project };

  if (doc.media?.length) {
    doc.media.sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      if (a.type === "video" && b.type !== "video") return 1;
      if (b.type === "video" && a.type !== "video") return -1;
      return 0;
    });

    doc.media = await Promise.all(
      doc.media.map(async (m) => ({
        ...m,
        url: await gcsService.getSignedUrl(m.gcsKey),
      })),
    );
  }

  return doc;
};

const buildUniqueSlug = async (title) => {
  let slug = slugify(title);
  let counter = 0;
  let exists = await Project.findOne({ slug });

  while (exists) {
    counter += 1;
    slug = `${slugify(title)}-${counter}`;
    exists = await Project.findOne({ slug });
  }

  return slug;
};

const countProjectUnits = async (projectId) =>
  Property.countDocuments({ projectId, deletedAt: null });

const aggregateUnitStats = async (projectIds) => {
  if (!projectIds.length) return new Map();

  const rows = await Property.aggregate([
    {
      $match: {
        projectId: { $in: projectIds },
        deletedAt: null,
        status: { $in: ["active", "sold"] },
      },
    },
    {
      $group: {
        _id: "$projectId",
        unitCount: { $sum: 1 },
        priceMin: { $min: "$price" },
        priceMax: { $max: "$price" },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row]));
};

const maybeRependActiveProject = async (
  project,
  { isAdmin, previousStatus, notify = true },
) => {
  if (isAdmin || previousStatus !== "active") return false;
  if (project.status !== "active") return false;

  project.status = "pending";
  await project.save();
  if (notify) await notifyAdminsOfPendingProject(project);
  return true;
};

const buildProjectIdFilter = (id, user) => {
  const filter = { _id: id };
  if (user?.role !== ROLES.ADMIN) {
    filter.deletedAt = null;
  }
  return filter;
};

const findProjectById = (id, user) =>
  Project.findOne(buildProjectIdFilter(id, user))
    .populate("agentId", "firstName lastName email phone avatar")
    .populate("ownerId", "firstName lastName email phone");

const applyAdminStatusTransition = (project, normalizedStatus) => {
  if (normalizedStatus === "archived") {
    Object.assign(project, buildArchiveUpdate());
    return;
  }

  project.deletedAt = null;
  project.status = normalizedStatus;
};

const applyProjectCatalogRules = async (payload) => {
  if (payload.amenities?.length) {
    await catalogService.assertValidAmenities(payload.amenities);
  }
};

const enrichProjectDoc = async (project, statsMap) => {
  const doc = await attachMediaUrls(project);
  const stats = statsMap?.get(String(project._id));
  doc.unitCount = stats?.unitCount ?? 0;
  doc.priceMin = stats?.priceMin ?? null;
  doc.priceMax = stats?.priceMax ?? null;
  return doc;
};

const validatePublishIfNeeded = async (project, nextStatus) => {
  if (nextStatus !== "pending" && nextStatus !== "active") return;
  const unitCount = await countProjectUnits(project._id);
  assertPublishUnitCardinality(project.kind, unitCount);
};

export const projectService = {
  canManageProject,

  async create(data, user) {
    const slug = await buildUniqueSlug(data.title);
    const payload = { ...data };
    const isAdmin = user.role === ROLES.ADMIN;

    await applyProjectCatalogRules(payload);

    payload.status = normalizeSellerStatus(payload.status, {
      isAdmin,
      isCreate: true,
    });

    await validatePublishIfNeeded({ kind: payload.kind }, payload.status);

    const project = await Project.create({
      ...payload,
      slug,
      ownerId: user._id,
      agentId:
        payload.agentId || (user.role === ROLES.AGENT ? user._id : undefined),
      location: { type: "Point", ...payload.location },
    });

    if (project.status === "pending" && !isAdmin) {
      await notifyAdminsOfPendingProject(project);
    }

    await cacheService.invalidateListingCaches();

    return attachMediaUrls(project);
  },

  async list(query) {
    const cacheKey = cacheService.buildKey("projects", query);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { page, limit, skip } = parsePagination(query);
    const filter = { deletedAt: null };

    if (query.kind) filter.kind = query.kind;
    filter.status = resolvePublicListStatus(query.status);
    if (query.city) filter["location.city"] = new RegExp(query.city, "i");

    const hasTextSearch = Boolean(query.search);
    const hasGeoSearch =
      query.lat != null && query.lng != null && query.radiusKm != null;

    if (hasTextSearch) {
      filter.$text = { $search: query.search };
    }

    if (hasGeoSearch) {
      if (hasTextSearch) {
        filter.location = {
          $geoWithin: {
            $centerSphere: [
              [query.lng, query.lat],
              query.radiusKm / EARTH_RADIUS_KM,
            ],
          },
        };
      } else {
        filter.location = {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [query.lng, query.lat] },
            $maxDistance: query.radiusKm * 1000,
          },
        };
      }
    }

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("agentId", "firstName lastName email phone avatar")
        .populate("ownerId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    const statsMap = await aggregateUnitStats(projects.map((p) => p._id));
    const data = await Promise.all(
      projects.map((p) => enrichProjectDoc(p, statsMap)),
    );

    const result = {
      projects: data,
      pagination: buildPaginationMeta(total, page, limit),
    };

    await cacheService.set(cacheKey, result, 300);
    return result;
  },

  async getById(id, { incrementView = true, user, includeUnits = false } = {}) {
    const project = await findProjectById(id, user);

    if (!project) throw new AppError("Project not found", 404);

    if (
      project.status !== "active" &&
      !canViewNonActiveProject(project, user)
    ) {
      throw new AppError("Project not found", 404);
    }

    if (incrementView && project.status === "active") {
      project.viewCount += 1;
      await project.save({ validateBeforeSave: false });
    }

    const statsMap = await aggregateUnitStats([project._id]);
    const doc = await enrichProjectDoc(project, statsMap);

    if (includeUnits) {
      const units = await Property.find(buildUnitsQuery(project, user))
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
      doc.units = units;
    }

    return doc;
  },

  async getBySlug(slug, options = {}) {
    const project = await Project.findOne({
      slug: slug.toLowerCase(),
      deletedAt: null,
    })
      .populate("agentId", "firstName lastName email phone avatar")
      .populate("ownerId", "firstName lastName email phone");

    if (!project) throw new AppError("Project not found", 404);

    return this.getById(project._id, {
      ...options,
      incrementView: options.incrementView ?? true,
    });
  },

  async update(id, data, user) {
    const project = await findProjectById(id, user);
    if (!project) throw new AppError("Project not found", 404);

    if (!canManageProject(project, user)) {
      throw new AppError("Not authorized to update this project", 403);
    }

    const isAdmin = user.role === ROLES.ADMIN;

    if (!isAdmin && project.status === "sold") {
      throw new AppError("Sold projects cannot be edited", 400);
    }

    const previousStatus = project.status;
    const patch = { ...data };

    if (patch.amenities !== undefined) {
      await catalogService.assertValidAmenities(patch.amenities);
    }

    const normalizedStatus = normalizeSellerStatus(patch.status, {
      isAdmin,
      isCreate: false,
    });

    if (normalizedStatus !== undefined) {
      patch.status = normalizedStatus;
      await validatePublishIfNeeded(project, normalizedStatus);
    } else {
      delete patch.status;
    }

    if (patch.title && patch.title !== project.title) {
      patch.slug = await buildUniqueSlug(patch.title);
    }

    if (patch.location) {
      patch.location = { type: "Point", ...patch.location };
    }

    const materialChanges =
      !isAdmin &&
      previousStatus === "active" &&
      normalizedStatus === undefined &&
      hasMaterialChanges(project, patch);

    Object.assign(project, patch);

    if (materialChanges) {
      project.status = "pending";
    }

    if (isAdmin && normalizedStatus !== undefined) {
      applyAdminStatusTransition(project, normalizedStatus);
    }

    await project.save();

    if (patch.location) {
      await Property.updateMany(
        { projectId: project._id, deletedAt: null },
        {
          $set: {
            location: project.location,
          },
        },
      );
    }

    if (
      !isAdmin &&
      project.status === "pending" &&
      previousStatus !== "pending"
    ) {
      await submitDraftUnitsForReview(project);
      await notifyAdminsOfPendingProject(project);
    }

    await cacheService.invalidateListingCaches();

    const statsMap = await aggregateUnitStats([project._id]);
    return enrichProjectDoc(project, statsMap);
  },

  async softDelete(id, user) {
    const project = await Project.findOne({ _id: id, deletedAt: null });
    if (!project) throw new AppError("Project not found", 404);

    if (!canManageProject(project, user)) {
      throw new AppError("Not authorized to delete this project", 403);
    }

    Object.assign(project, buildArchiveUpdate());
    await project.save();
    await cacheService.invalidateListingCaches();
  },

  async restore(id, user) {
    const project = await Project.findOne({
      _id: id,
      deletedAt: { $ne: null },
    });

    if (!project) throw new AppError("Project not found in trash", 404);

    if (!canManageProject(project, user)) {
      throw new AppError("Not authorized to restore this project", 403);
    }

    Object.assign(project, buildRestoreUpdate());
    await project.save();
    await cacheService.invalidateListingCaches();

    return attachMediaUrls(project);
  },

  async listMine(user, query) {
    const { page, limit, skip } = parsePagination(query);
    const conditions = [
      { $or: [{ ownerId: user._id }, { agentId: user._id }] },
      query.trashed === "true"
        ? { deletedAt: { $ne: null } }
        : { deletedAt: null },
    ];

    if (query.status) conditions.push({ status: query.status });
    if (query.kind) conditions.push({ kind: query.kind });

    const textFilter = buildPropertyTextFilter(query.search);
    if (textFilter) conditions.push(textFilter);

    const filter =
      conditions.length === 1 ? conditions[0] : { $and: conditions };

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("agentId", "firstName lastName email phone avatar")
        .populate("ownerId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    const statsMap = await aggregateUnitStats(projects.map((p) => p._id));
    const data = await Promise.all(
      projects.map((p) => enrichProjectDoc(p, statsMap)),
    );

    return {
      projects: data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async listUnits(projectId, user) {
    const project = await findProjectById(projectId, user);
    if (!project) throw new AppError("Project not found", 404);

    if (
      project.status !== "active" &&
      !canViewNonActiveProject(project, user)
    ) {
      throw new AppError("Project not found", 404);
    }

    return Property.find(buildUnitsQuery(project, user)).sort({
      sortOrder: 1,
      createdAt: 1,
    });
  },

  async uploadMedia(id, file, user) {
    const project = await findProjectById(id, user);
    if (!project) throw new AppError("Project not found", 404);

    if (!canManageProject(project, user)) {
      throw new AppError("Not authorized", 403);
    }

    const isVideo = file.mimetype.startsWith("video/");

    if (isVideo && project.media.some((item) => item.type === "video")) {
      throw new AppError(
        "Project already has a video. Remove the existing video before uploading a new one.",
        400,
      );
    }

    const uploaded = await gcsService.uploadFile(file.buffer, {
      folder: "projects",
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    const nextImageOrder = project.media
      .filter((item) => item.type !== "video")
      .reduce((max, item) => Math.max(max, item.order ?? 0), -1);

    project.media.push({
      ...uploaded,
      type: isVideo ? "video" : "image",
      order: isVideo ? project.media.length : nextImageOrder + 1,
    });

    const previousStatus = project.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await project.save();

    await maybeRependActiveProject(project, { isAdmin, previousStatus });
    await cacheService.invalidateListingCaches();

    const media = project.media[project.media.length - 1];
    return {
      ...media.toObject(),
      url: await gcsService.getSignedUrl(media.gcsKey),
    };
  },

  async removeMedia(id, mediaId, user) {
    const project = await findProjectById(id, user);
    if (!project) throw new AppError("Project not found", 404);

    if (!canManageProject(project, user)) {
      throw new AppError("Not authorized", 403);
    }

    const media = project.media.id(mediaId);
    if (!media) throw new AppError("Media not found", 404);

    await gcsService.deleteFile(media.gcsKey);
    media.deleteOne();

    const previousStatus = project.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await project.save();

    await maybeRependActiveProject(project, { isAdmin, previousStatus });
    await cacheService.invalidateListingCaches();
  },

  async reorderMedia(id, { imageIds }, user) {
    const project = await findProjectById(id, user);
    if (!project) throw new AppError("Project not found", 404);

    if (!canManageProject(project, user)) {
      throw new AppError("Not authorized", 403);
    }

    const imageMedia = project.media.filter((item) => item.type !== "video");
    if (imageIds.length !== imageMedia.length) {
      throw new AppError(
        "imageIds must include every listing photo exactly once",
        400,
      );
    }

    const uniqueIds = new Set(imageIds.map(String));
    if (uniqueIds.size !== imageIds.length) {
      throw new AppError("imageIds must not contain duplicates", 400);
    }

    for (const item of imageMedia) {
      if (!uniqueIds.has(String(item._id))) {
        throw new AppError(
          "imageIds must include every listing photo exactly once",
          400,
        );
      }
    }

    for (let index = 0; index < imageIds.length; index += 1) {
      const media = project.media.id(imageIds[index]);
      if (!media || media.type === "video") {
        throw new AppError("Invalid image id in imageIds", 400);
      }
      media.order = index;
    }

    const previousStatus = project.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await project.save();

    await maybeRependActiveProject(project, { isAdmin, previousStatus });
    await cacheService.invalidateListingCaches();

    return attachMediaUrls(project);
  },
};
