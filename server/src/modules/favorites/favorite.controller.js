import { favoriteService } from "./favorite.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const favoriteController = {
  list: async (req, res) => {
    const result = await favoriteService.list(req.user._id, req.query);
    ApiResponse.paginated(res, result.favorites, result.pagination);
  },

  add: async (req, res) => {
    const favorite = await favoriteService.add(
      req.user._id,
      req.body.propertyId,
    );
    ApiResponse.created(res, favorite, "Added to favorites");
  },

  remove: async (req, res) => {
    await favoriteService.remove(req.user._id, req.params.propertyId);
    ApiResponse.success(res, null, "Removed from favorites");
  },

  check: async (req, res) => {
    const result = await favoriteService.check(
      req.user._id,
      req.params.propertyId,
    );
    ApiResponse.success(res, result);
  },
};
