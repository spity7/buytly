import mongoose from "mongoose";
import { Property } from "../properties/property.model.js";
import { Project } from "../projects/project.model.js";
import { PropertyTypeCatalog } from "./property-type.model.js";
import { AmenityCatalog } from "./amenity.model.js";
import {
  DEFAULT_AMENITIES,
  DEFAULT_PROPERTY_TYPES,
  PROTECTED_PROPERTY_TYPE_VALUES,
} from "./catalog.defaults.js";
import { AppError } from "../../shared/AppError.js";
import { nearbyService } from "../../services/nearby.service.js";
import { getRequestSiteId } from "../../shared/requestContext.js";

/** Matches public property list browse (active units on live parent projects). */
const PUBLIC_PARENT_PROJECT_STATUSES = ["active", "sold"];

async function getPublicBrowseProjectIds(siteId) {
  return Project.find({
    siteId,
    deletedAt: null,
    status: { $in: PUBLIC_PARENT_PROJECT_STATUSES },
  }).distinct("_id");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function labelMatchFilter(siteId, label, excludeId) {
  const trimmed = label.trim();
  const filter = {
    siteId,
    label: { $regex: new RegExp(`^${escapeRegExp(trimmed)}$`, "i") },
  };

  if (excludeId) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  return filter;
}

const assertPropertyTypeNotProtected = (value, action) => {
  if (PROTECTED_PROPERTY_TYPE_VALUES.includes(value)) {
    throw new AppError(
      `The "${value}" property type is protected and cannot be ${action}.`,
      409,
    );
  }
};

async function upsertDefaultCatalogEntries(Model, entries, siteId) {
  await Promise.all(
    entries.map((entry) =>
      Model.updateOne(
        { siteId, value: entry.value },
        {
          $setOnInsert: {
            siteId,
            label: entry.label,
            sortOrder: entry.sortOrder,
            isActive: true,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

/** After first successful bootstrap per site, skip repeated default upserts on every catalog read. */
const defaultsBootstrappedBySite = new Map();

/** One bootstrap at a time per site (parallel catalog reads share the same work). */
const ensureDefaultsPromiseBySite = new Map();

const siteKey = (siteId) => String(siteId);

export const catalogService = {
  /** Test-only: clear in-memory bootstrap flags after DB wipe. */
  resetBootstrapCache() {
    defaultsBootstrappedBySite.clear();
    ensureDefaultsPromiseBySite.clear();
  },

  async ensureRequiredPropertyTypes(siteId = getRequestSiteId()) {
    for (const value of PROTECTED_PROPERTY_TYPE_VALUES) {
      const entry = DEFAULT_PROPERTY_TYPES.find((item) => item.value === value);
      if (!entry) continue;

      await PropertyTypeCatalog.updateOne(
        { siteId, value: entry.value },
        {
          $set: {
            label: entry.label,
            sortOrder: entry.sortOrder,
            isActive: true,
          },
          $setOnInsert: { siteId },
        },
        { upsert: true },
      );
    }
  },

  async ensureDefaults(siteId = getRequestSiteId()) {
    const key = siteKey(siteId);

    if (defaultsBootstrappedBySite.get(key)) {
      const amenityCount = await AmenityCatalog.countDocuments({ siteId });

      if (amenityCount > 0) {
        await this.ensureRequiredPropertyTypes(siteId);
        return;
      }

      defaultsBootstrappedBySite.set(key, false);
    }

    if (!ensureDefaultsPromiseBySite.get(key)) {
      const promise = this._ensureDefaults(siteId)
        .then(() => {
          defaultsBootstrappedBySite.set(key, true);
        })
        .finally(() => {
          ensureDefaultsPromiseBySite.delete(key);
        });
      ensureDefaultsPromiseBySite.set(key, promise);
    }
    return ensureDefaultsPromiseBySite.get(key);
  },

  async _ensureDefaults(siteId) {
    await upsertDefaultCatalogEntries(
      AmenityCatalog,
      DEFAULT_AMENITIES,
      siteId,
    );
    await this.ensureRequiredPropertyTypes(siteId);
  },

  async listPropertyTypes({ activeOnly = true } = {}) {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const filter = { siteId, ...(activeOnly ? { isActive: true } : {}) };
    const items = await PropertyTypeCatalog.find(filter).sort({
      sortOrder: 1,
      label: 1,
    });
    const values = items.map((item) => item.value);
    const listingCounts =
      await this.countPublicListingsByPropertyTypeValues(values);

    return items.map((item) => ({
      ...item.toPublicJSON(),
      listingCount: listingCounts.get(item.value) ?? 0,
    }));
  },

  async listAmenities({ activeOnly = true } = {}) {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const filter = { siteId, ...(activeOnly ? { isActive: true } : {}) };
    const items = await AmenityCatalog.find(filter).sort({
      sortOrder: 1,
      label: 1,
    });
    return items.map((item) => item.toPublicJSON());
  },

  async countListingsByPropertyTypeValues(values = []) {
    if (!values.length) return new Map();

    const siteId = getRequestSiteId();
    const rows = await Property.aggregate([
      { $match: { siteId, type: { $in: values } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id, row.count]));
  },

  async countPublicListingsByPropertyTypeValues(values = []) {
    if (!values.length) return new Map();

    const siteId = getRequestSiteId();
    const publicProjectIds = await getPublicBrowseProjectIds(siteId);

    const rows = await Property.aggregate([
      {
        $match: {
          siteId,
          deletedAt: null,
          status: "active",
          projectId: { $in: publicProjectIds },
          type: { $in: values },
        },
      },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id, row.count]));
  },

  async countListingsByAmenityValues(values = []) {
    if (!values.length) return new Map();

    const siteId = getRequestSiteId();
    const rows = await Property.aggregate([
      { $match: { siteId, amenities: { $in: values } } },
      { $unwind: "$amenities" },
      { $match: { amenities: { $in: values } } },
      { $group: { _id: "$amenities", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id, row.count]));
  },

  async listPropertyTypesForAdmin() {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const items = await PropertyTypeCatalog.find({ siteId }).sort({
      sortOrder: 1,
      label: 1,
    });
    const values = items.map((item) => item.value);
    const listingCounts = await this.countListingsByPropertyTypeValues(values);

    return items.map((item) => ({
      ...item.toPublicJSON(),
      listingCount: listingCounts.get(item.value) ?? 0,
    }));
  },

  async listAmenitiesForAdmin() {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const items = await AmenityCatalog.find({ siteId }).sort({
      sortOrder: 1,
      label: 1,
    });
    const values = items.map((item) => item.value);
    const listingCounts = await this.countListingsByAmenityValues(values);

    return items.map((item) => ({
      ...item.toPublicJSON(),
      listingCount: listingCounts.get(item.value) ?? 0,
    }));
  },

  async getActivePropertyTypeValues() {
    const items = await this.listPropertyTypes({ activeOnly: true });
    return items.map((item) => item.value);
  },

  async getActiveAmenityValues() {
    const items = await this.listAmenities({ activeOnly: true });
    return items.map((item) => item.value);
  },

  async assertValidPropertyType(value) {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const exists = await PropertyTypeCatalog.exists({
      siteId,
      value,
      isActive: true,
    });
    if (!exists) {
      throw new AppError("Invalid or inactive property type", 400);
    }
  },

  async assertValidAmenities(amenities = []) {
    if (!amenities.length) return;

    await this.ensureDefaults();
    const active = new Set(await this.getActiveAmenityValues());
    const invalid = amenities.filter((item) => !active.has(item));
    if (invalid.length) {
      throw new AppError(
        `Invalid or inactive amenities: ${invalid.join(", ")}`,
        400,
      );
    }
  },

  async assertValidPropertyTypesForPreferences(propertyTypes = []) {
    if (!propertyTypes.length) return;

    await this.ensureDefaults();
    const active = new Set(await this.getActivePropertyTypeValues());
    const invalid = propertyTypes.filter((item) => !active.has(item));
    if (invalid.length) {
      throw new AppError(
        `Invalid or inactive property types: ${invalid.join(", ")}`,
        400,
      );
    }
  },

  async assertUniquePropertyTypeLabel(label, excludeId = null) {
    if (!label?.trim()) return;

    const siteId = getRequestSiteId();
    const existing = await PropertyTypeCatalog.findOne(
      labelMatchFilter(siteId, label, excludeId),
    );
    if (existing) {
      throw new AppError(
        "A property type with this display name already exists",
        409,
      );
    }
  },

  async assertUniquePropertyTypeValue(value, excludeId = null) {
    if (!value?.trim()) return;

    const siteId = getRequestSiteId();
    const filter = { siteId, value: value.trim().toLowerCase() };
    if (excludeId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const existing = await PropertyTypeCatalog.findOne(filter);
    if (existing) {
      throw new AppError(
        "A property type equivalent to this name already exists",
        409,
      );
    }
  },

  async assertUniqueAmenityLabel(label, excludeId = null) {
    if (!label?.trim()) return;

    const siteId = getRequestSiteId();
    const existing = await AmenityCatalog.findOne(
      labelMatchFilter(siteId, label, excludeId),
    );
    if (existing) {
      throw new AppError(
        "An amenity with this display name already exists",
        409,
      );
    }
  },

  async assertUniqueAmenityValue(value, excludeId = null) {
    if (!value?.trim()) return;

    const siteId = getRequestSiteId();
    const filter = { siteId, value: value.trim() };
    if (excludeId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const existing = await AmenityCatalog.findOne(filter);
    if (existing) {
      throw new AppError("An amenity with this name already exists", 409);
    }
  },

  async createPropertyType(data) {
    await this.ensureDefaults();
    await this.assertUniquePropertyTypeLabel(data.label);
    await this.assertUniquePropertyTypeValue(data.value);

    try {
      const doc = await PropertyTypeCatalog.create({
        ...data,
        siteId: getRequestSiteId(),
      });
      return doc.toPublicJSON();
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError(
          "A property type equivalent to this name already exists",
          409,
        );
      }
      throw error;
    }
  },

  async updatePropertyType(id, data) {
    await this.ensureDefaults();
    const patch = { ...data };
    delete patch.value;

    const siteId = getRequestSiteId();
    const existing = await PropertyTypeCatalog.findOne({ _id: id, siteId });
    if (!existing) throw new AppError("Property type not found", 404);

    if (PROTECTED_PROPERTY_TYPE_VALUES.includes(existing.value)) {
      assertPropertyTypeNotProtected(existing.value, "edited");
    }

    if (patch.isActive === false) {
      assertPropertyTypeNotProtected(existing.value, "deactivated");
    }

    if (patch.label) {
      await this.assertUniquePropertyTypeLabel(patch.label, id);
    }

    const doc = await PropertyTypeCatalog.findOneAndUpdate(
      { _id: id, siteId },
      patch,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!doc) throw new AppError("Property type not found", 404);
    return doc.toPublicJSON();
  },

  async deletePropertyType(id) {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const doc = await PropertyTypeCatalog.findOne({ _id: id, siteId });
    if (!doc) throw new AppError("Property type not found", 404);

    assertPropertyTypeNotProtected(doc.value, "deleted");

    const inUse = await Property.countDocuments({ siteId, type: doc.value });
    if (inUse > 0) {
      throw new AppError(
        "Cannot delete a property type that is used by existing listings. Deactivate it instead.",
        409,
      );
    }

    await doc.deleteOne();
  },

  async createAmenity(data) {
    await this.ensureDefaults();
    await this.assertUniqueAmenityLabel(data.label);
    await this.assertUniqueAmenityValue(data.value);

    try {
      const doc = await AmenityCatalog.create({
        ...data,
        siteId: getRequestSiteId(),
      });
      return doc.toPublicJSON();
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("An amenity with this name already exists", 409);
      }
      throw error;
    }
  },

  async updateAmenity(id, data) {
    await this.ensureDefaults();
    const patch = { ...data };
    delete patch.value;

    if (patch.label) {
      await this.assertUniqueAmenityLabel(patch.label, id);
    }

    const siteId = getRequestSiteId();
    const doc = await AmenityCatalog.findOneAndUpdate(
      { _id: id, siteId },
      patch,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!doc) throw new AppError("Amenity not found", 404);
    return doc.toPublicJSON();
  },

  async deleteAmenity(id) {
    const siteId = getRequestSiteId();
    await this.ensureDefaults(siteId);
    const doc = await AmenityCatalog.findOne({ _id: id, siteId });
    if (!doc) throw new AppError("Amenity not found", 404);

    const inUse = await Property.countDocuments({
      siteId,
      amenities: doc.value,
    });
    if (inUse > 0) {
      throw new AppError(
        "Cannot delete an amenity that is used by existing listings. Deactivate it instead.",
        409,
      );
    }

    await doc.deleteOne();
  },

  async getNearbyPreview(lat, lng) {
    try {
      const result = await nearbyService.fetchNearbyPlaces(lat, lng);
      return result;
    } catch {
      // Do not cache failures — Overpass mirrors recover; cached "unavailable"
      // would block previews for 24h after a transient outage.
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
};
