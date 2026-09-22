import mongoose from "mongoose";
import { PROJECT_KINDS, PROPERTY_STATUSES } from "../../shared/constants.js";

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

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    kind: { type: String, enum: PROJECT_KINDS, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      address: String,
      city: { type: String, index: true },
      country: String,
    },
    amenities: [{ type: String }],
    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: "draft",
      index: true,
    },
    media: [mediaSchema],
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

projectSchema.index({ location: "2dsphere" });
projectSchema.index({ kind: 1, status: 1 });
projectSchema.index({ title: "text", description: "text" });

export const Project = mongoose.model("Project", projectSchema);
