import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    label: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

amenitySchema.index({ siteId: 1, value: 1 }, { unique: true });

amenitySchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    value: this.value,
    label: this.label,
    sortOrder: this.sortOrder,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const AmenityCatalog = mongoose.model("AmenityCatalog", amenitySchema);
