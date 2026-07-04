import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["buyer", "seller", "agent", "admin"],
      default: "buyer",
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatar: {
      gcsKey: String,
      mimeType: String,
      size: Number,
    },
    preferences: {
      budgetMin: Number,
      budgetMax: Number,
      locations: [{ type: String, trim: true }],
      propertyTypes: [{ type: String }],
    },
    savedSearches: [savedSearchSchema],
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ role: 1 });
userSchema.index({ deletedAt: 1 });

userSchema.virtual("fullName").get(function () {
  return (
    [this.firstName, this.lastName].filter(Boolean).join(" ") || this.email
  );
});

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    firstName: this.firstName,
    lastName: this.lastName,
    phone: this.phone,
    avatar: this.avatar,
    preferences: this.preferences,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
