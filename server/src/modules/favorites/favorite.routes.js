import { Router } from "express";
import { favoriteController } from "./favorite.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import {
  addFavoriteSchema,
  listFavoritesSchema,
  propertyIdParamSchema,
} from "./favorite.validation.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /favorites:
 *   get:
 *     operationId: listFavorites
 *     summary: List user favorites
 *     description: Returns a paginated list of saved properties with thumbnail URLs.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Favorites list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedFavoritesResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/",
  validate(listFavoritesSchema, "query"),
  asyncHandler(favoriteController.list),
);

/**
 * @swagger
 * /favorites:
 *   post:
 *     operationId: addFavorite
 *     summary: Add property to favorites
 *     description: Saves a property to the authenticated user's favorites.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId]
 *             properties:
 *               propertyId:
 *                 $ref: '#/components/schemas/ObjectId'
 *     responses:
 *       201:
 *         description: Added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Favorite'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  "/",
  validate(addFavoriteSchema),
  asyncHandler(favoriteController.add),
);

/**
 * @swagger
 * /favorites/check/{propertyId}:
 *   get:
 *     operationId: checkFavorite
 *     summary: Check if property is favorited
 *     description: Returns whether the authenticated user has saved the given property.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PropertyIdParam'
 *     responses:
 *       200:
 *         description: Favorite status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/IsFavoriteData'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/check/:propertyId",
  validateMultiple({ params: propertyIdParamSchema }),
  asyncHandler(favoriteController.check),
);

/**
 * @swagger
 * /favorites/{propertyId}:
 *   delete:
 *     operationId: removeFavorite
 *     summary: Remove property from favorites
 *     description: Removes a property from the authenticated user's favorites.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PropertyIdParam'
 *     responses:
 *       200:
 *         description: Removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:propertyId",
  validateMultiple({ params: propertyIdParamSchema }),
  asyncHandler(favoriteController.remove),
);

export default router;
