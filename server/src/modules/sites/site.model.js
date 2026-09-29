import mongoose from "mongoose";
import {
  PLATFORM_LISTING_POLICY,
  SITE_KIND,
} from "./site.constants.js";

const brandingSchema = new mongoose.Schema(
  {
    supportEmail: { type: String, trim: true, default: "" },
    supportPhone: { type: String, trim: true, default: "" },
    supportPhoneDisplay: { type: String, trim: true, default: "" },
    siteDisplayName: { type: String, trim: true, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    contactInboxEmail: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const siteSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    kind: {
      type: String,
      enum: Object.values(SITE_KIND),
      required: true,
    },
    name: { type: String, required: true, trim: true },
    primaryDomain: { type: String, required: true, lowercase: true, trim: true },
    domains: [{ type: String, lowercase: true, trim: true }],
    publicUrl: { type: String, trim: true, default: "" },
    branding: { type: brandingSchema, default: () => ({}) },
    platformListingPolicy: {
      type: String,
      enum: Object.values(PLATFORM_LISTING_POLICY),
      default: PLATFORM_LISTING_POLICY.OPT_IN,
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

siteSchema.index({ domains: 1 });
siteSchema.index({ primaryDomain: 1 });

siteSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    slug: this.slug,
    kind: this.kind,
    name: this.name,
    primaryDomain: this.primaryDomain,
    publicUrl: this.publicUrl || `https://${this.primaryDomain}`,
    branding: this.branding,
    platformListingPolicy: this.platformListingPolicy,
    isActive: this.isActive,
  };
};

export const Site = mongoose.model("Site", siteSchema);
