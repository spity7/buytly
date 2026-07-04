import mongoose from "mongoose";
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
} from "../../shared/constants.js";

const transactionSchema = new mongoose.Schema(
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
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: "pending",
      index: true,
    },
    notes: { type: String, maxlength: 2000 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
