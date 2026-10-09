import mongoose from "mongoose";

const agentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: { type: String, trim: true },
    agency: { type: String, trim: true },
    bio: { type: String, maxlength: 2000 },
    specialties: [{ type: String }],
    city: { type: String, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AgentProfile = mongoose.model("AgentProfile", agentProfileSchema);
