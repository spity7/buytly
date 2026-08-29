import mongoose from "mongoose";
import { PropertyReview } from "./property-review.model.js";
import { Property } from "../properties/property.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { ROLES } from "../../shared/constants.js";

const canViewNonActiveProperty = (property, user) =>
  Boolean(
    user &&
    (user.role === ROLES.ADMIN ||
      property.ownerId.equals(user._id) ||
      (property.agentId && property.agentId.equals(user._id))),
  );

const attachUserAvatarUrl = async (review) => {
  const doc = review.toObject ? review.toObject() : { ...review };
  const user = doc.userId;

  if (user?.avatar?.gcsKey) {
    user.avatar = {
      ...user.avatar,
      url: await gcsService.getSignedUrl(user.avatar.gcsKey),
    };
  }

  return doc;
};

const getViewableProperty = async (
  propertyId,
  user,
  { requireActive = false } = {},
) => {
  const property = await Property.findOne({ _id: propertyId, deletedAt: null });
  if (!property) throw new AppError("Property not found", 404);

  if (requireActive && property.status !== "active") {
    throw new AppError("Property not found", 404);
  }

  if (
    property.status !== "active" &&
    !canViewNonActiveProperty(property, user)
  ) {
    throw new AppError("Property not found", 404);
  }

  return property;
};

export const propertyReviewService = {
  async list(propertyId, query, user) {
    await getViewableProperty(propertyId, user);

    const { page, limit, skip } = parsePagination(query);

    const [statsResult, reviews, total] = await Promise.all([
      PropertyReview.aggregate([
        {
          $match: {
            propertyId: new mongoose.Types.ObjectId(propertyId),
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
      PropertyReview.find({ propertyId })
        .populate("userId", "firstName lastName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PropertyReview.countDocuments({ propertyId }),
    ]);

    const stats = statsResult[0] || { averageRating: 0, reviewCount: 0 };
    const data = await Promise.all(reviews.map(attachUserAvatarUrl));

    return {
      reviews: data,
      stats: {
        averageRating: Number((stats.averageRating || 0).toFixed(1)),
        reviewCount: stats.reviewCount || 0,
      },
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async create(propertyId, userId, data) {
    await getViewableProperty(propertyId, null, { requireActive: true });

    const existing = await PropertyReview.findOne({ propertyId, userId });
    if (existing) {
      throw new AppError("You have already reviewed this property", 409);
    }

    try {
      const review = await PropertyReview.create({
        propertyId,
        userId,
        ...data,
      });

      const populated = await review.populate(
        "userId",
        "firstName lastName avatar",
      );
      return attachUserAvatarUrl(populated);
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("You have already reviewed this property", 409);
      }
      throw error;
    }
  },

  async remove(propertyId, reviewId, user) {
    await getViewableProperty(propertyId, user);

    const review = await PropertyReview.findOne({ _id: reviewId, propertyId });
    if (!review) throw new AppError("Review not found", 404);

    const isAuthor = review.userId.equals(user._id);
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new AppError("Not authorized to delete this review", 403);
    }

    await review.deleteOne();
  },

  async hasUserReviewed(propertyId, userId, user) {
    if (!userId) return false;
    await getViewableProperty(propertyId, user);
    const review = await PropertyReview.findOne({ propertyId, userId }).select(
      "_id",
    );
    return Boolean(review);
  },
};
