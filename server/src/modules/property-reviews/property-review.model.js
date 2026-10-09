import mongoose from "mongoose";

const propertyReviewSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

propertyReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });
propertyReviewSchema.index({ propertyId: 1, createdAt: -1 });

export const PropertyReview = mongoose.model(
  "PropertyReview",
  propertyReviewSchema,
);
