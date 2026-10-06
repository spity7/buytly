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
 *     description: Units from sites that hide prices (features.hidePublicPrices) have price null plus priceLabel, never match minPrice/maxPrice, and come after priced units when sortBy=price.
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

/**
 * @swagger
 * /platform/featured-projects:
 *   get:
 *     operationId: listPlatformFeaturedProjects
 *     summary: Partner projects visible on the platform site (Buytly)
 *     description: Projects from sites that hide prices have priceMin/priceMax null plus priceLabel.
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
 *         description: Paginated partner projects with source site metadata
 */
router.get(
  "/featured-projects",
  asyncHandler(platformController.featuredProjects),
);

export default router;
