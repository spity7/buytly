import mongoose from "mongoose";
import { PROPERTY_STATUSES } from "../../shared/constants.js";

const mediaSchema = new mongoose.Schema(
  {
    gcsKey: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    order: { type: Number, default: 0 },
    mimeType: String,
    size: Number,
  },
  { _id: true },
);

const floorPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    gcsKey: { type: String },
  },
  { _id: true },
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    type: { type: String, required: true, trim: true, lowercase: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      address: String,
      city: { type: String, index: true },
      country: String,
    },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    area: { type: Number, min: 0 },
    areaUnit: { type: String, default: "sqm" },
    amenities: [{ type: String }],
    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: "draft",
      index: true,
    },
    media: [mediaSchema],
    floorPlans: [floorPlanSchema],
    virtualTourUrl: { type: String, trim: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

propertySchema.index({ location: "2dsphere" });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1, price: 1 });
propertySchema.index({ projectId: 1, sortOrder: 1 });
propertySchema.index({ title: "text", description: "text" });

export const Property = mongoose.model("Property", propertySchema);
