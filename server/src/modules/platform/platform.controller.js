import { platformService } from "./platform.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const platformController = {
  featuredListings: async (req, res) => {
    const result = await platformService.listFeaturedListings(req.query);
    ApiResponse.paginated(res, result.properties, result.pagination);
  },

  featuredProjects: async (req, res) => {
    const result = await platformService.listFeaturedProjects(req.query);
    ApiResponse.paginated(res, result.projects, result.pagination);
  },
};
