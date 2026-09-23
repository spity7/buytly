import mongoose from "mongoose";
import { Property } from "../properties/property.model.js";
import { PropertyTypeCatalog } from "./property-type.model.js";
import { AmenityCatalog } from "./amenity.model.js";
import {
  DEFAULT_AMENITIES,
  DEFAULT_PROPERTY_TYPES,
  PROTECTED_PROPERTY_TYPE_VALUES,
} from "./catalog.defaults.js";
import { AppError } from "../../shared/AppError.js";
import { nearbyService } from "../../services/nearby.service.js";
import { cacheService } from "../../services/cache.service.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function labelMatchFilter(label, excludeId) {
  const trimmed = label.trim();
  const filter = {
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

async function upsertDefaultCatalogEntries(Model, entries) {
  await Promise.all(
    entries.map((entry) =>
      Model.updateOne(
        { value: entry.value },
        {
          $setOnInsert: {
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

/** After first successful bootstrap, skip repeated default upserts on every catalog read. */
let defaultsBootstrapped = false;

/** One bootstrap at a time per process (parallel catalog reads share the same work). */
let ensureDefaultsPromise = null;

export const catalogService = {
  async ensureRequiredPropertyTypes() {
    for (const value of PROTECTED_PROPERTY_TYPE_VALUES) {
      const entry = DEFAULT_PROPERTY_TYPES.find((item) => item.value === value);
      if (!entry) continue;

      await PropertyTypeCatalog.updateOne(
        { value: entry.value },
        {
          $set: {
            label: entry.label,
            sortOrder: entry.sortOrder,
            isActive: true,
          },
        },
        { upsert: true },
      );
    }
  },

  async ensureDefaults() {
    if (defaultsBootstrapped) {
      const [typeCount, amenityCount] = await Promise.all([
        PropertyTypeCatalog.estimatedDocumentCount(),
        AmenityCatalog.estimatedDocumentCount(),
      ]);

      if (typeCount > 0 && amenityCount > 0) {
        await this.ensureRequiredPropertyTypes();
        return;
      }

      defaultsBootstrapped = false;
    }

    if (!ensureDefaultsPromise) {
      ensureDefaultsPromise = this._ensureDefaults()
        .then(() => {
          defaultsBootstrapped = true;
        })
        .finally(() => {
          ensureDefaultsPromise = null;
        });
    }
    return ensureDefaultsPromise;
  },

  async _ensureDefaults() {
    await upsertDefaultCatalogEntries(
      PropertyTypeCatalog,
      DEFAULT_PROPERTY_TYPES,
    );
    await upsertDefaultCatalogEntries(AmenityCatalog, DEFAULT_AMENITIES);
    await this.ensureRequiredPropertyTypes();
  },

  async listPropertyTypes({ activeOnly = true } = {}) {
    await this.ensureDefaults();
    const filter = activeOnly ? { isActive: true } : {};
    const items = await PropertyTypeCatalog.find(filter).sort({
      sortOrder: 1,
      label: 1,
    });
    return items.map((item) => item.toPublicJSON());
  },

  async listAmenities({ activeOnly = true } = {}) {
    await this.ensureDefaults();
    const filter = activeOnly ? { isActive: true } : {};
    const items = await AmenityCatalog.find(filter).sort({
      sortOrder: 1,
      label: 1,
    });
    return items.map((item) => item.toPublicJSON());
  },

  async countListingsByPropertyTypeValues(values = []) {
    if (!values.length) return new Map();

    const rows = await Property.aggregate([
      { $match: { type: { $in: values } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id, row.count]));
  },

  async countListingsByAmenityValues(values = []) {
    if (!values.length) return new Map();

    const rows = await Property.aggregate([
      { $match: { amenities: { $in: values } } },
      { $unwind: "$amenities" },
      { $match: { amenities: { $in: values } } },
      { $group: { _id: "$amenities", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [row._id, row.count]));
  },

  async listPropertyTypesForAdmin() {
    await this.ensureDefaults();
    const items = await PropertyTypeCatalog.find({}).sort({
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
    await this.ensureDefaults();
    const items = await AmenityCatalog.find({}).sort({
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
    await this.ensureDefaults();
    const exists = await PropertyTypeCatalog.exists({
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

    const existing = await PropertyTypeCatalog.findOne(
      labelMatchFilter(label, excludeId),
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

    const filter = { value: value.trim().toLowerCase() };
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

    const existing = await AmenityCatalog.findOne(
      labelMatchFilter(label, excludeId),
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

    const filter = { value: value.trim() };
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
      const doc = await PropertyTypeCatalog.create(data);
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
    const { value: _immutable, ...patch } = data;

    const existing = await PropertyTypeCatalog.findById(id);
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

    const doc = await PropertyTypeCatalog.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new AppError("Property type not found", 404);
    return doc.toPublicJSON();
  },

  async deletePropertyType(id) {
    await this.ensureDefaults();
    const doc = await PropertyTypeCatalog.findById(id);
    if (!doc) throw new AppError("Property type not found", 404);

    assertPropertyTypeNotProtected(doc.value, "deleted");

    const inUse = await Property.countDocuments({ type: doc.value });
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
      const doc = await AmenityCatalog.create(data);
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
    const { value: _immutable, ...patch } = data;

    if (patch.label) {
      await this.assertUniqueAmenityLabel(patch.label, id);
    }

    const doc = await AmenityCatalog.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new AppError("Amenity not found", 404);
    return doc.toPublicJSON();
  },

  async deleteAmenity(id) {
    await this.ensureDefaults();
    const doc = await AmenityCatalog.findById(id);
    if (!doc) throw new AppError("Amenity not found", 404);

    const inUse = await Property.countDocuments({ amenities: doc.value });
    if (inUse > 0) {
      throw new AppError(
        "Cannot delete an amenity that is used by existing listings. Deactivate it instead.",
        409,
      );
    }

    await doc.deleteOne();
  },

  async getNearbyPreview(lat, lng) {
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
