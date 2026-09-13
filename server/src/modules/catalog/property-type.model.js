import mongoose from "mongoose";

const propertyTypeSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

propertyTypeSchema.methods.toPublicJSON = function () {
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

export const PropertyTypeCatalog = mongoose.model(
  "PropertyTypeCatalog",
  propertyTypeSchema,
);
