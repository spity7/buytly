import { AgentProfile } from "./agent.model.js";
import { User } from "../users/user.model.js";
import { Property } from "../properties/property.model.js";
import { propertyService } from "../properties/property.service.js";
import { gcsService } from "../../services/gcs.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { ROLES } from "../../shared/constants.js";

export const agentService = {
  async list(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.city) filter.city = new RegExp(query.city, "i");
    if (query.specialty) filter.specialties = query.specialty;

    const [agents, total] = await Promise.all([
      AgentProfile.find(filter)
        .populate("userId", "firstName lastName email phone avatar")
        .sort({ rating: -1 })
        .skip(skip)
        .limit(limit),
      AgentProfile.countDocuments(filter),
    ]);

    const data = await Promise.all(
      agents.map(async (agent) => {
        const doc = agent.toObject();
        const user = doc.userId;
        if (user?.avatar?.gcsKey) {
          user.avatar = await gcsService.resolveAvatar(user.avatar);
        }
        const listingsCount = await Property.countDocuments({
          agentId: user._id,
          status: "active",
          deletedAt: null,
        });
        return { ...doc, listingsCount };
      }),
    );

    return {
      agents: data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getMyProfile(userId) {
    return this.getById(userId);
  },

  async getById(id) {
    const user = await User.findOne({
      _id: id,
      role: ROLES.AGENT,
      deletedAt: null,
      isActive: true,
    });
    if (!user) throw new AppError("Agent not found", 404);

    let profile = await AgentProfile.findOne({ userId: id });

    if (!profile) {
      profile = await AgentProfile.create({ userId: id });
    }

    const listingsCount = await Property.countDocuments({
      agentId: id,
      status: "active",
      deletedAt: null,
    });

    const result = {
      user: user.toPublicJSON(),
      profile: profile.toObject(),
      listingsCount,
    };

    if (result.user.avatar?.gcsKey) {
      result.user.avatar = await gcsService.resolveAvatar(result.user.avatar);
    }

    return result;
  },

  async updateMyProfile(userId, data) {
    const user = await User.findOne({ _id: userId, role: ROLES.AGENT });
    if (!user) throw new AppError("Agent profile not found", 404);

    const profile = await AgentProfile.findOneAndUpdate({ userId }, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    return profile;
  },

  async getAgentProperties(agentId, query) {
    const user = await User.findOne({
      _id: agentId,
      role: ROLES.AGENT,
      deletedAt: null,
    });
    if (!user) throw new AppError("Agent not found", 404);

    return propertyService.getByAgent(agentId, query);
  },
};
