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
    phoneCountryCode: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatar: {
      gcsKey: String,
      mimeType: String,
      size: Number,
    },
    socialLinks: {
      instagram: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
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
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
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
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

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
    phoneCountryCode: this.phoneCountryCode,
    phoneNumber: this.phoneNumber,
    phone:
      this.phone ||
      (this.phoneCountryCode && this.phoneNumber
        ? `${this.phoneCountryCode}${this.phoneNumber}`
        : undefined),
    avatar: this.avatar?.gcsKey
      ? {
          gcsKey: this.avatar.gcsKey,
          mimeType: this.avatar.mimeType,
          size: this.avatar.size,
        }
      : undefined,
    socialLinks: this.socialLinks,
    preferences: this.preferences,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
