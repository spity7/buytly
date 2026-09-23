import { Property } from "./property.model.js";
import { Project } from "../projects/project.model.js";
import { projectService } from "../projects/project.service.js";
import {
  applySingleProjectUnitType,
  assertCanAddUnitToProject,
  assertParentProjectAllowsUnitStatus,
  assertPublishUnitCardinality,
  assertSingleProjectUnitType,
} from "../projects/project-cardinality.js";
import { gcsService } from "../../services/gcs.service.js";
import { cacheService } from "../../services/cache.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { buildPropertyTextFilter } from "../../shared/search.js";
import { slugify } from "../../utils/slugify.js";
import { DEFAULT_CURRENCY, ROLES } from "../../shared/constants.js";
import { catalogService } from "../catalog/catalog.service.js";
import { purgePropertyRecord } from "../../services/listing-purge.service.js";
import { User } from "../users/user.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { nearbyService } from "../../services/nearby.service.js";
import {
  isPropertyTerminal,
  normalizeSellerStatus,
  resolvePublicListStatus,
  hasMaterialChanges,
  buildArchiveUpdate,
  buildRestoreUpdate,
} from "./property-status.js";

const EARTH_RADIUS_KM = 6378.1;

const canManageProperty = (property, user) =>
  Boolean(
    user &&
    (user.role === ROLES.ADMIN ||
      property.ownerId.equals(user._id) ||
      (property.agentId && property.agentId.equals(user._id))),
  );

const canViewNonActiveProperty = (property, user) =>
  canManageProperty(property, user);

const notifyAdminsOfPendingListing = async (property) => {
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
      projectId: property.projectId?._id || property.projectId,
      projectTitle: property.projectId?.title,
    },
  );
};

const attachMediaUrls = async (property) => {
  if (!property) return property;
  const doc = property.toObject ? property.toObject() : { ...property };

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

  if (doc.floorPlans?.length) {
    doc.floorPlans = await Promise.all(
      doc.floorPlans.map(async (plan) => ({
        ...plan,
        url: plan.gcsKey
          ? await gcsService.getSignedUrl(plan.gcsKey)
          : undefined,
      })),
    );
  }

  return doc;
};

const buildUniqueSlug = async (title) => {
  let slug = slugify(title);
  let counter = 0;
  let exists = await Property.findOne({ slug });

  while (exists) {
    counter += 1;
    slug = `${slugify(title)}-${counter}`;
    exists = await Property.findOne({ slug });
  }

  return slug;
};

const maybeRependActiveListing = async (
  property,
  { isAdmin, previousStatus, notify = true },
) => {
  if (isAdmin || previousStatus !== "active") return false;
  if (property.status !== "active") return false;

  property.status = "pending";
  await property.save();
  if (notify) await notifyAdminsOfPendingListing(property);
  return true;
};

const buildPropertyIdFilter = (id, user) => {
  const filter = { _id: id };
  if (!user) {
    filter.deletedAt = null;
    return filter;
  }
  if (user.role === ROLES.ADMIN) {
    return filter;
  }

  filter.$or = [{ ownerId: user._id }, { agentId: user._id }];
  return filter;
};

const findPropertyById = (id, user) =>
  Property.findOne(buildPropertyIdFilter(id, user))
    .populate("projectId", "title slug kind status")
    .populate("agentId", "firstName lastName email phone avatar")
    .populate("ownerId", "firstName lastName email phone");

const projectLocationSnapshot = (project) => {
  const loc = project.location?.toObject
    ? project.location.toObject()
    : { ...project.location };
  return { type: "Point", ...loc };
};

const validateUnitPublishForProject = async (
  project,
  nextStatus,
  { isAdmin },
) => {
  if (nextStatus !== "pending" && nextStatus !== "active") return;
  assertParentProjectAllowsUnitStatus(project, nextStatus, { isAdmin });
  const unitCount = await Property.countDocuments({
    projectId: project._id,
    deletedAt: null,
  });
  assertPublishUnitCardinality(project.kind, unitCount);
};

const PUBLIC_PARENT_PROJECT_STATUSES = ["active", "sold"];

const assertPublicParentProject = async (property) => {
  const populated = property.projectId;
  const project =
    populated?.status != null
      ? populated
      : await Project.findById(property.projectId).select("status deletedAt");

  if (
    !project ||
    project.deletedAt ||
    !PUBLIC_PARENT_PROJECT_STATUSES.includes(project.status)
  ) {
    throw new AppError("Property not found", 404);
  }
};

const applyAdminStatusTransition = (property, normalizedStatus) => {
  if (normalizedStatus === "archived") {
    Object.assign(property, buildArchiveUpdate());
    return;
  }

  property.deletedAt = null;
  property.status = normalizedStatus;
};

const applyListingCatalogRules = async (payload) => {
  await catalogService.assertValidPropertyType(payload.type);
  if (payload.amenities?.length) {
    await catalogService.assertValidAmenities(payload.amenities);
  }
  payload.currency = DEFAULT_CURRENCY;
};

export const propertyService = {
  async create(data, user) {
    const project = await Project.findOne({
      _id: data.projectId,
      deletedAt: null,
    });
    if (!project) throw new AppError("Project not found", 404);

    if (!projectService.canManageProject(project, user)) {
      throw new AppError("Not authorized to add units to this project", 403);
    }

    const existingUnits = await Property.countDocuments({
      projectId: project._id,
      deletedAt: null,
    });
    assertCanAddUnitToProject(project, existingUnits);

    const slug = await buildUniqueSlug(data.title);
    const payload = { ...data };
    const isAdmin = user.role === ROLES.ADMIN;

    applySingleProjectUnitType(project, payload);
    await applyListingCatalogRules(payload);

    payload.status = normalizeSellerStatus(payload.status, {
      isAdmin,
      isCreate: true,
    });

    if (payload.status === "pending" || payload.status === "active") {
      assertPublishUnitCardinality(project.kind, existingUnits + 1);
    }

    const property = await Property.create({
      ...payload,
      slug,
      projectId: project._id,
      ownerId: project.ownerId,
      agentId:
        payload.agentId ||
        project.agentId ||
        (user.role === ROLES.AGENT ? user._id : undefined),
      location: projectLocationSnapshot(project),
    });

    if (property.status === "pending" && !isAdmin) {
      property.projectId = project;
      await notifyAdminsOfPendingListing(property);
    }

    await cacheService.invalidateListingCaches();

    return attachMediaUrls(property);
  },

  async list(query) {
    const cacheKey = cacheService.buildKey("properties", query);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { page, limit, skip } = parsePagination(query);
    const filter = { deletedAt: null };

    const publicProjectIds = await Project.find({
      deletedAt: null,
      status: { $in: PUBLIC_PARENT_PROJECT_STATUSES },
    }).distinct("_id");
    filter.projectId = { $in: publicProjectIds };

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }

    if (query.type) filter.type = query.type;
    if (query.projectId) filter.projectId = query.projectId;
    filter.status = resolvePublicListStatus(query.status);
    if (query.city) filter["location.city"] = new RegExp(query.city, "i");
    if (query.bedrooms) filter.bedrooms = { $gte: query.bedrooms };

    const hasTextSearch = Boolean(query.search);
    const hasGeoSearch =
      query.lat != null && query.lng != null && query.radiusKm != null;

    if (hasTextSearch) {
      filter.$text = { $search: query.search };
    }

    if (hasGeoSearch) {
      // MongoDB rejects $text with $nearSphere/$geoNear in the same query.
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

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("projectId", "title slug kind status")
        .populate("agentId", "firstName lastName email phone avatar")
        .populate("ownerId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    const data = await Promise.all(properties.map(attachMediaUrls));

    const result = {
      properties: data,
      pagination: buildPaginationMeta(total, page, limit),
    };

    await cacheService.set(cacheKey, result, 300);
    return result;
  },

  async getById(id, { incrementView = true, user } = {}) {
    const property = await findPropertyById(id, user);

    if (!property) throw new AppError("Property not found", 404);

    if (
      property.status !== "active" &&
      !canViewNonActiveProperty(property, user)
    ) {
      throw new AppError("Property not found", 404);
    }

    if (
      !canManageProperty(property, user) &&
      PUBLIC_PARENT_PROJECT_STATUSES.includes(property.status)
    ) {
      await assertPublicParentProject(property);
    }

    if (incrementView && property.status === "active") {
      property.viewCount += 1;
      await property.save({ validateBeforeSave: false });
    }

    return attachMediaUrls(property);
  },

  async getNearby(id, { user } = {}) {
    const property = await findPropertyById(id, user);

    if (!property) throw new AppError("Property not found", 404);

    if (
      property.status !== "active" &&
      !canViewNonActiveProperty(property, user)
    ) {
      throw new AppError("Property not found", 404);
    }

    const [lng, lat] = property.location?.coordinates || [];
    if (lng == null || lat == null) {
      return { categories: [], source: null };
    }

    const cacheKey = cacheService.buildKey("nearby", {
      lat: Number(lat).toFixed(3),
      lng: Number(lng).toFixed(3),
    });
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await nearbyService.fetchNearbyPlaces(lat, lng);
      await cacheService.set(cacheKey, result, 86400);
      return result;
    } catch {
      return {
        categories: [
          { title: "Education", places: [] },
          { title: "Health & Medical", places: [] },
          { title: "Transportation", places: [] },
        ],
        source: null,
        unavailable: true,
      };
    }
  },

  async update(id, data, user) {
    const property = await findPropertyById(id, user);
    if (!property) throw new AppError("Property not found", 404);

    const canEdit = canManageProperty(property, user);

    if (!canEdit)
      throw new AppError("Not authorized to update this property", 403);

    const isAdmin = user.role === ROLES.ADMIN;

    if (!isAdmin && isPropertyTerminal(property.status)) {
      throw new AppError("Sold or archived listings cannot be edited", 400);
    }

    const previousStatus = property.status;
    const patch = { ...data };

    const project = await Project.findById(property.projectId);
    if (!project) throw new AppError("Project not found", 404);

    if (patch.type !== undefined) {
      assertSingleProjectUnitType(project, patch.type);
      await catalogService.assertValidPropertyType(patch.type);
    }
    applySingleProjectUnitType(project, patch);
    if (patch.amenities !== undefined) {
      await catalogService.assertValidAmenities(patch.amenities);
    }
    patch.currency = DEFAULT_CURRENCY;

    const normalizedStatus = normalizeSellerStatus(patch.status, {
      isAdmin,
      isCreate: false,
    });

    if (normalizedStatus !== undefined) {
      patch.status = normalizedStatus;
      await validateUnitPublishForProject(project, normalizedStatus, {
        isAdmin,
      });
    } else {
      delete patch.status;
    }

    if (patch.title && patch.title !== property.title) {
      patch.slug = await buildUniqueSlug(patch.title);
    }

    delete patch.location;
    delete patch.projectId;

    const materialChanges =
      !isAdmin &&
      previousStatus === "active" &&
      normalizedStatus === undefined &&
      hasMaterialChanges(property, patch);

    Object.assign(property, patch);

    if (materialChanges) {
      property.status = "pending";
    }

    if (isAdmin && normalizedStatus !== undefined) {
      applyAdminStatusTransition(property, normalizedStatus);
    }

    await property.save();

    if (
      !isAdmin &&
      property.status === "pending" &&
      previousStatus !== "pending"
    ) {
      await notifyAdminsOfPendingListing(property);
    }

    await cacheService.invalidateListingCaches();

    return attachMediaUrls(property);
  },

  async softDelete(id, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canDelete = canManageProperty(property, user);

    if (!canDelete)
      throw new AppError("Not authorized to delete this property", 403);

    Object.assign(property, buildArchiveUpdate());
    await property.save();
    await cacheService.invalidateListingCaches();
  },

  async restore(id, user) {
    const property = await Property.findOne({
      _id: id,
      deletedAt: { $ne: null },
    });

    if (!property) throw new AppError("Property not found in trash", 404);

    if (!canManageProperty(property, user)) {
      throw new AppError("Not authorized to restore this property", 403);
    }

    Object.assign(property, buildRestoreUpdate());
    await property.save();
    await cacheService.invalidateListingCaches();

    return attachMediaUrls(property);
  },

  async permanentDelete(id, user) {
    const property = await findPropertyById(id, user);
    if (!property) throw new AppError("Property not found", 404);

    if (!canManageProperty(property, user)) {
      throw new AppError("Not authorized to delete this property", 403);
    }

    await purgePropertyRecord(property, { requireTrash: true });
    await cacheService.invalidateListingCaches();
  },

  async uploadMedia(id, file, user) {
    const property = await findPropertyById(id, user);
    if (!property) throw new AppError("Property not found", 404);

    const canEdit = canManageProperty(property, user);

    if (!canEdit) throw new AppError("Not authorized", 403);

    const isVideo = file.mimetype.startsWith("video/");

    if (isVideo && property.media.some((item) => item.type === "video")) {
      throw new AppError(
        "Property already has a video. Remove the existing video before uploading a new one.",
        400,
      );
    }

    const uploaded = await gcsService.uploadFile(file.buffer, {
      folder: "properties",
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    const nextImageOrder = property.media
      .filter((item) => item.type !== "video")
      .reduce((max, item) => Math.max(max, item.order ?? 0), -1);

    property.media.push({
      ...uploaded,
      type: isVideo ? "video" : "image",
      order: isVideo ? property.media.length : nextImageOrder + 1,
    });

    const previousStatus = property.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await property.save();

    await maybeRependActiveListing(property, { isAdmin, previousStatus });
    await cacheService.invalidateListingCaches();

    const media = property.media[property.media.length - 1];
    return {
      ...media.toObject(),
      url: await gcsService.getSignedUrl(media.gcsKey),
    };
  },

  async uploadFloorPlanImage(id, file, user) {
    const property = await findPropertyById(id, user);
    if (!property) throw new AppError("Property not found", 404);

    const canEdit = canManageProperty(property, user);
    if (!canEdit) throw new AppError("Not authorized", 403);

    if (!file.mimetype.startsWith("image/")) {
      throw new AppError("Floor plan must be an image", 400);
    }

    const uploaded = await gcsService.uploadFile(file.buffer, {
      folder: "properties/floor-plans",
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    return {
      gcsKey: uploaded.gcsKey,
      url: await gcsService.getSignedUrl(uploaded.gcsKey),
    };
  },

  async removeMedia(id, mediaId, user) {
    const property = await findPropertyById(id, user);
    if (!property) throw new AppError("Property not found", 404);

    const canEdit = canManageProperty(property, user);

    if (!canEdit) throw new AppError("Not authorized", 403);

    const media = property.media.id(mediaId);
    if (!media) throw new AppError("Media not found", 404);

    await gcsService.deleteFile(media.gcsKey);
    media.deleteOne();

    const previousStatus = property.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await property.save();

    await maybeRependActiveListing(property, { isAdmin, previousStatus });
    await cacheService.invalidateListingCaches();
  },

  async reorderMedia(id, { imageIds }, user) {
    const property = await findPropertyById(id, user);
    if (!property) throw new AppError("Property not found", 404);

    if (!canManageProperty(property, user)) {
      throw new AppError("Not authorized", 403);
    }

    const imageMedia = property.media.filter((item) => item.type !== "video");
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
      const media = property.media.id(imageIds[index]);
      if (!media || media.type === "video") {
        throw new AppError("Invalid image id in imageIds", 400);
      }
      media.order = index;
    }

    const previousStatus = property.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await property.save();

    await maybeRependActiveListing(property, { isAdmin, previousStatus });
    await cacheService.invalidateListingCaches();

    return attachMediaUrls(property);
  },

  async listMine(user, query) {
    const { page, limit, skip } = parsePagination(query);
    const conditions = [
      { $or: [{ ownerId: user._id }, { agentId: user._id }] },
      query.trashed === "true"
        ? { deletedAt: { $ne: null } }
        : { deletedAt: null },
    ];

    if (query.trashed !== "true") {
      const activeProjectIds = await Project.find({
        $or: [{ ownerId: user._id }, { agentId: user._id }],
        deletedAt: null,
      }).distinct("_id");
      conditions.push({ projectId: { $in: activeProjectIds } });
    }

    if (query.status) conditions.push({ status: query.status });
    if (query.type) conditions.push({ type: query.type });
    if (query.projectId) conditions.push({ projectId: query.projectId });

    const textFilter = buildPropertyTextFilter(query.search);
    if (textFilter) conditions.push(textFilter);

    const filter =
      conditions.length === 1 ? conditions[0] : { $and: conditions };

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("projectId", "title slug kind status")
        .populate("agentId", "firstName lastName email phone avatar")
        .populate("ownerId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    const data = await Promise.all(properties.map(attachMediaUrls));

    return {
      properties: data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getByAgent(agentId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { agentId, deletedAt: null, status: "active" };

    const [properties, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Property.countDocuments(filter),
    ]);

    const data = await Promise.all(properties.map(attachMediaUrls));

    return {
      properties: data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
