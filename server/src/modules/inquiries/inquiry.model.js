import mongoose from "mongoose";
import { INQUIRY_STATUSES, INQUIRY_TOPICS } from "../../shared/constants.js";

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
    // Names are optional; "" when the form had no name fields.
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    // As typed on single-name forms, else "firstName lastName".
    fullName: { type: String, trim: true, default: "" },
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
    message: { type: String, trim: true, default: "" },
    topic: { type: String, enum: INQUIRY_TOPICS, default: "inquiry" },
    // Schedule-a-tour requests: calendar date (YYYY-MM-DD, no time zone) and
    // the chosen time slot as submitted (e.g. "9:00 AM").
    preferredDate: { type: String, trim: true, default: "" },
    preferredTime: { type: String, trim: true, default: "" },
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
