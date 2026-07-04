import { agentService } from "./agent.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const agentController = {
  list: async (req, res) => {
    const result = await agentService.list(req.query);
    ApiResponse.paginated(res, result.agents, result.pagination);
  },

  getById: async (req, res) => {
    const agent = await agentService.getById(req.params.id);
    ApiResponse.success(res, agent);
  },

  updateMyProfile: async (req, res) => {
    const profile = await agentService.updateMyProfile(req.user._id, req.body);
    ApiResponse.success(res, profile, "Agent profile updated");
  },

  getProperties: async (req, res) => {
    const result = await agentService.getAgentProperties(
      req.params.id,
      req.query,
    );
    ApiResponse.paginated(res, result.properties, result.pagination);
  },
};
