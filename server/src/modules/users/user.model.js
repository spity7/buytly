import mongoose from "mongoose";
import { ROLES } from "../../shared/constants.js";
import { normalizeNotificationPreferences } from "../notifications/notification.preferences.js";

const channelPreferenceSchema = {
  booking: { type: Boolean, default: true },
  transaction: { type: Boolean, default: true },
  property: { type: Boolean, default: true },
  auth: { type: Boolean, default: true },
  system: { type: Boolean, default: true },
};

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
    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },
    googleId: { type: String, select: false },
    passwordHash: {
      type: String,
      required: function requiredPasswordForLocal() {
        return this.authProvider === "local";
      },
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.BUYER,
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
    notificationPreferences: {
      email: channelPreferenceSchema,
      inApp: channelPreferenceSchema,
    },
    savedSearches: [savedSearchSchema],
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    deletedAt: { type: Date, default: null },
    deletedEmail: { type: String, lowercase: true, trim: true },
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
userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null, googleId: { $type: "string" } },
  },
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
    notificationPreferences: normalizeNotificationPreferences(
      this.notificationPreferences,
    ),
    authProvider: this.authProvider,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

userSchema.methods.toAdminJSON = function () {
  return {
    ...this.toPublicJSON(),
    deletedAt: this.deletedAt ?? null,
    deletedEmail: this.deletedEmail ?? null,
    isDeleted: Boolean(this.deletedAt),
  };
};

export const User = mongoose.model("User", userSchema);
