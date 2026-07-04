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

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Saved properties
 */

router.use(authenticate);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: List user favorites
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites list
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
 *     summary: Add property to favorites
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
 *               propertyId: { type: string }
 *     responses:
 *       201:
 *         description: Added to favorites
 */
router.post(
  "/",
  validate(addFavoriteSchema),
  asyncHandler(favoriteController.add),
);

router.get(
  "/check/:propertyId",
  validateMultiple({ params: propertyIdParamSchema }),
  asyncHandler(favoriteController.check),
);

router.delete(
  "/:propertyId",
  validateMultiple({ params: propertyIdParamSchema }),
  asyncHandler(favoriteController.remove),
);

export default router;
