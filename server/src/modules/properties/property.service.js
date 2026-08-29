import { Property } from "./property.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { cacheService } from "../../services/cache.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { slugify } from "../../utils/slugify.js";
import { ROLES, NOTIFICATION_TYPES } from "../../shared/constants.js";
import { User } from "../users/user.model.js";
import { notificationService } from "../notifications/notification.service.js";
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

  await Promise.all(
    admins.map((admin) =>
      notificationService
        .notify({
          userId: admin._id,
          type: NOTIFICATION_TYPES.PROPERTY,
          title: "Listing pending review",
          message: `"${property.title}" was submitted and awaits approval.`,
          data: { propertyId: property._id },
          sendEmail: true,
          emailTemplate: "generic",
          emailData: {
            title: "Listing pending review",
            message: `"${property.title}" was submitted and awaits approval.`,
          },
        })
        .catch((err) =>
          console.error(
            "Admin pending-listing notification failed:",
            err.message,
          ),
        ),
    ),
  );
};

const attachMediaUrls = async (property) => {
  if (!property) return property;
  const doc = property.toObject ? property.toObject() : { ...property };

  if (doc.media?.length) {
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

export const propertyService = {
  async create(data, user) {
    const slug = await buildUniqueSlug(data.title);
    const payload = { ...data };
    const isAdmin = user.role === ROLES.ADMIN;

    payload.status = normalizeSellerStatus(payload.status, {
      isAdmin,
      isCreate: true,
    });

    const property = await Property.create({
      ...payload,
      slug,
      ownerId: user._id,
      agentId:
        payload.agentId || (user.role === ROLES.AGENT ? user._id : undefined),
      location: { type: "Point", ...payload.location },
    });

    if (property.status === "pending" && !isAdmin) {
      await notifyAdminsOfPendingListing(property);
    }

    await cacheService.invalidateProperties();

    return attachMediaUrls(property);
  },

  async list(query) {
    const cacheKey = cacheService.buildKey("properties", query);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { page, limit, skip } = parsePagination(query);
    const filter = { deletedAt: null };

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }

    if (query.type) filter.type = query.type;
    if (query.listingType) filter.listingType = query.listingType;
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
    const property = await Property.findOne({ _id: id, deletedAt: null })
      .populate("agentId", "firstName lastName email phone avatar")
      .populate("ownerId", "firstName lastName email phone");

    if (!property) throw new AppError("Property not found", 404);

    if (
      property.status !== "active" &&
      !canViewNonActiveProperty(property, user)
    ) {
      throw new AppError("Property not found", 404);
    }

    if (incrementView && property.status === "active") {
      property.viewCount += 1;
      await property.save({ validateBeforeSave: false });
    }

    return attachMediaUrls(property);
  },

  async update(id, data, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canEdit = canManageProperty(property, user);

    if (!canEdit)
      throw new AppError("Not authorized to update this property", 403);

    const isAdmin = user.role === ROLES.ADMIN;

    if (!isAdmin && isPropertyTerminal(property.status)) {
      throw new AppError(
        "Sold, rented, or archived listings cannot be edited",
        400,
      );
    }

    const previousStatus = property.status;
    const normalizedStatus = normalizeSellerStatus(data.status, {
      isAdmin,
      isCreate: false,
    });

    if (normalizedStatus !== undefined) {
      data.status = normalizedStatus;
    } else {
      delete data.status;
    }

    if (data.title && data.title !== property.title) {
      data.slug = await buildUniqueSlug(data.title);
    }

    if (data.location) {
      data.location = { type: "Point", ...data.location };
    }

    const materialChanges =
      !isAdmin &&
      previousStatus === "active" &&
      normalizedStatus === undefined &&
      hasMaterialChanges(property, data);

    Object.assign(property, data);

    if (materialChanges) {
      property.status = "pending";
    }

    await property.save();

    if (
      !isAdmin &&
      property.status === "pending" &&
      previousStatus !== "pending"
    ) {
      await notifyAdminsOfPendingListing(property);
    }

    await cacheService.invalidateProperties();

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
    await cacheService.invalidateProperties();
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
    await cacheService.invalidateProperties();

    return attachMediaUrls(property);
  },

  async uploadMedia(id, file, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canEdit = canManageProperty(property, user);

    if (!canEdit) throw new AppError("Not authorized", 403);

    const isVideo = file.mimetype.startsWith("video/");
    const uploaded = await gcsService.uploadFile(file.buffer, {
      folder: "properties",
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    property.media.push({
      ...uploaded,
      type: isVideo ? "video" : "image",
      order: property.media.length,
    });

    const previousStatus = property.status;
    const isAdmin = user.role === ROLES.ADMIN;
    await property.save();

    await maybeRependActiveListing(property, { isAdmin, previousStatus });
    await cacheService.invalidateProperties();

    const media = property.media[property.media.length - 1];
    return {
      ...media.toObject(),
      url: await gcsService.getSignedUrl(media.gcsKey),
    };
  },

  async uploadFloorPlanImage(id, file, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
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
    const property = await Property.findOne({ _id: id, deletedAt: null });
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
    await cacheService.invalidateProperties();
  },

  async listMine(user, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      $or: [{ ownerId: user._id }, { agentId: user._id }],
    };

    if (query.trashed === "true") {
      filter.deletedAt = { $ne: null };
    } else {
      filter.deletedAt = null;
    }

    if (query.status) filter.status = query.status;

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [properties, total] = await Promise.all([
      Property.find(filter)
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
