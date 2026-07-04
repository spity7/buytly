import { Property } from "./property.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { cacheService } from "../../services/cache.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { slugify } from "../../utils/slugify.js";
import { ROLES } from "../../shared/constants.js";

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

export const propertyService = {
  async create(data, user) {
    const slug = await buildUniqueSlug(data.title);

    const property = await Property.create({
      ...data,
      slug,
      ownerId: user._id,
      agentId:
        data.agentId || (user.role === ROLES.AGENT ? user._id : undefined),
      location: { type: "Point", ...data.location },
    });

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
    if (query.status) filter.status = query.status;
    else filter.status = "active";
    if (query.city) filter["location.city"] = new RegExp(query.city, "i");
    if (query.bedrooms) filter.bedrooms = { $gte: query.bedrooms };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.lat && query.lng && query.radiusKm) {
      filter.location = {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [query.lng, query.lat] },
          $maxDistance: query.radiusKm * 1000,
        },
      };
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

  async getById(id, incrementView = true) {
    const property = await Property.findOne({ _id: id, deletedAt: null })
      .populate("agentId", "firstName lastName email phone avatar")
      .populate("ownerId", "firstName lastName email phone");

    if (!property) throw new AppError("Property not found", 404);

    if (incrementView) {
      property.viewCount += 1;
      await property.save({ validateBeforeSave: false });
    }

    return attachMediaUrls(property);
  },

  async update(id, data, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canEdit =
      user.role === ROLES.ADMIN ||
      property.ownerId.equals(user._id) ||
      (property.agentId && property.agentId.equals(user._id));

    if (!canEdit)
      throw new AppError("Not authorized to update this property", 403);

    if (data.title && data.title !== property.title) {
      data.slug = await buildUniqueSlug(data.title);
    }

    if (data.location) {
      data.location = { type: "Point", ...data.location };
    }

    Object.assign(property, data);
    await property.save();
    await cacheService.invalidateProperties();

    return attachMediaUrls(property);
  },

  async softDelete(id, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canDelete =
      user.role === ROLES.ADMIN || property.ownerId.equals(user._id);

    if (!canDelete)
      throw new AppError("Not authorized to delete this property", 403);

    property.deletedAt = new Date();
    property.status = "archived";
    await property.save();
    await cacheService.invalidateProperties();
  },

  async uploadMedia(id, file, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canEdit =
      user.role === ROLES.ADMIN ||
      property.ownerId.equals(user._id) ||
      (property.agentId && property.agentId.equals(user._id));

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

    await property.save();
    await cacheService.invalidateProperties();

    const media = property.media[property.media.length - 1];
    return {
      ...media.toObject(),
      url: await gcsService.getSignedUrl(media.gcsKey),
    };
  },

  async removeMedia(id, mediaId, user) {
    const property = await Property.findOne({ _id: id, deletedAt: null });
    if (!property) throw new AppError("Property not found", 404);

    const canEdit =
      user.role === ROLES.ADMIN ||
      property.ownerId.equals(user._id) ||
      (property.agentId && property.agentId.equals(user._id));

    if (!canEdit) throw new AppError("Not authorized", 403);

    const media = property.media.id(mediaId);
    if (!media) throw new AppError("Media not found", 404);

    await gcsService.deleteFile(media.gcsKey);
    media.deleteOne();
    await property.save();
    await cacheService.invalidateProperties();
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
