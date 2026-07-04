import mongoose from "mongoose";
import { BOOKING_STATUSES } from "../../shared/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    message: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending",
      index: true,
    },
    agentNotes: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
