import mongoose from "mongoose";
import { INQUIRY_STATUSES } from "../../shared/constants.js";

/**
 * Public contact / inquire form submissions. Private to the site they were
 * submitted on — admin reads and writes always filter by the request siteId.
 */
const inquirySchema = new mongoose.Schema(
  {
    // Indexed through the siteId-prefixed compound indexes below.
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    residenceType: { type: String, trim: true, default: "" },
    // Only stored when the unit belongs to the same site.
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    unitLabel: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    pagePath: { type: String, trim: true, default: "" },
    sourceUrl: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: "new",
    },
    // True once the site inbox notification was sent.
    emailDelivered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

inquirySchema.index({ siteId: 1, createdAt: -1 });
inquirySchema.index({ siteId: 1, status: 1 });

export const Inquiry = mongoose.model("Inquiry", inquirySchema);
