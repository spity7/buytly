import { Router } from "express";
import { platformController } from "./platform.controller.js";
import { requirePlatformSite } from "../../middleware/resolveSite.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.use(requirePlatformSite);

/**
 * @swagger
 * /platform/featured-listings:
 *   get:
 *     operationId: listPlatformFeaturedListings
 *     summary: Partner listings visible on the platform site (Buytly)
 *     tags: [Platform]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated partner properties with source site metadata
 */
router.get(
  "/featured-listings",
  asyncHandler(platformController.featuredListings),
);

export default router;
