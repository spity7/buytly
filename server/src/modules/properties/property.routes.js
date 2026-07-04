import { Router } from "express";
import { propertyController } from "./property.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesSchema,
  propertyIdSchema,
  mediaIdSchema,
} from "./property.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property listings management
 */

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: List properties with filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated property list
 */
router.get(
  "/",
  validate(listPropertiesSchema, "query"),
  asyncHandler(propertyController.list),
);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Property details
 */
router.get(
  "/:id",
  validateMultiple({ params: propertyIdSchema }),
  asyncHandler(propertyController.getById),
);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a property listing
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Property created
 */
router.post(
  "/",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(createPropertySchema),
  asyncHandler(propertyController.create),
);

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema, body: updatePropertySchema }),
  asyncHandler(propertyController.update),
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema }),
  asyncHandler(propertyController.remove),
);

/**
 * @swagger
 * /properties/{id}/media:
 *   post:
 *     summary: Upload property media
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media uploaded
 */
router.post(
  "/:id/media",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema }),
  ...propertyController.uploadMedia,
);

router.delete(
  "/:id/media/:mediaId",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: mediaIdSchema }),
  asyncHandler(propertyController.removeMedia),
);

export default router;
