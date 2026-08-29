import { Favorite } from "./favorite.model.js";
import { Property } from "../properties/property.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";

export const favoriteService = {
  async list(userId, query) {
    const { page, limit, skip } = parsePagination(query);

    const [favorites, total] = await Promise.all([
      Favorite.find({ userId })
        .populate({
          path: "propertyId",
          match: { deletedAt: null },
          select:
            "title slug price currency type listingType location status media bedrooms bathrooms",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Favorite.countDocuments({ userId }),
    ]);

    const data = await Promise.all(
      favorites
        .filter((f) => f.propertyId)
        .map(async (f) => {
          const property = f.propertyId.toObject();
          if (property.media?.[0]?.gcsKey) {
            property.thumbnail = await gcsService.getSignedUrl(
              property.media[0].gcsKey,
            );
          }
          return { id: f._id, property, createdAt: f.createdAt };
        }),
    );

    return {
      favorites: data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async add(userId, propertyId) {
    const property = await Property.findOne({
      _id: propertyId,
      deletedAt: null,
      status: "active",
    });
    if (!property)
      throw new AppError("Property not found or not available", 404);

    const existing = await Favorite.findOne({ userId, propertyId });
    if (existing) throw new AppError("Property already in favorites", 409);

    const favorite = await Favorite.create({ userId, propertyId });
    return favorite;
  },

  async remove(userId, propertyId) {
    const result = await Favorite.deleteOne({ userId, propertyId });
    if (result.deletedCount === 0)
      throw new AppError("Favorite not found", 404);
  },

  async check(userId, propertyId) {
    const favorite = await Favorite.findOne({ userId, propertyId });
    return { isFavorite: !!favorite };
  },
};
