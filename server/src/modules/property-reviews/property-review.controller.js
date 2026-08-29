import { propertyReviewService } from "./property-review.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const propertyReviewController = {
  list: async (req, res) => {
    const result = await propertyReviewService.list(
      req.params.id,
      req.query,
      req.user,
    );
    ApiResponse.paginated(
      res,
      {
        reviews: result.reviews,
        stats: result.stats,
      },
      result.pagination,
    );
  },

  create: async (req, res) => {
    const review = await propertyReviewService.create(
      req.params.id,
      req.user._id,
      req.body,
    );
    ApiResponse.created(res, review, "Review submitted");
  },

  remove: async (req, res) => {
    await propertyReviewService.remove(
      req.params.id,
      req.params.reviewId,
      req.user,
    );
    ApiResponse.success(res, null, "Review deleted");
  },

  checkMine: async (req, res) => {
    const hasReviewed = await propertyReviewService.hasUserReviewed(
      req.params.id,
      req.user?._id,
      req.user,
    );
    ApiResponse.success(res, { hasReviewed });
  },
};
