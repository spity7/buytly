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
 * /properties:
 *   get:
 *     operationId: listProperties
 *     summary: List properties with filters
 *     description: Returns a paginated list of active properties. Supports price, type, geo-radius, full-text search, and sorting.
 *     tags: [Properties]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         example: 100000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         example: 500000
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/PropertyType'
 *       - in: query
 *         name: listingType
 *         schema:
 *           $ref: '#/components/schemas/ListingType'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/PropertyStatus'
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         example: Dubai
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         example: 2
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search on title and description. Can be combined with geo-radius filters.
 *         example: downtown apartment
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for geo-radius search (requires lng and radiusKm). Omit for a text-only search.
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for geo-radius search (requires lat and radiusKm)
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *         description: Search radius in kilometers (requires lat and lng)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, viewCount]
 *         example: price
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: asc
 *     responses:
 *       200:
 *         description: Paginated property list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPropertiesResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
 *     operationId: getPropertyById
 *     summary: Get property by ID
 *     description: Returns full property details with media signed URLs. Increments view count.
 *     tags: [Properties]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertySuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *     operationId: createProperty
 *     summary: Create a property listing
 *     description: Creates a new property listing. Requires seller, agent, or admin role.
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       201:
 *         description: Property created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertySuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(createPropertySchema),
  asyncHandler(propertyController.create),
);

/**
 * @swagger
 * /properties/{id}:
 *   patch:
 *     operationId: updateProperty
 *     summary: Update a property listing
 *     description: Partially updates a property. Only the owner, assigned agent, or admin can update.
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       200:
 *         description: Property updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertySuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema, body: updatePropertySchema }),
  asyncHandler(propertyController.update),
);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     operationId: deleteProperty
 *     summary: Delete a property listing
 *     description: Soft-deletes a property. Only the owner, assigned agent, or admin can delete.
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Property deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
 *     operationId: uploadPropertyMedia
 *     summary: Upload property media
 *     description: Uploads an image or video for a property (multipart/form-data field `media`).
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [media]
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Image or video file
 *     responses:
 *       201:
 *         description: Media uploaded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PropertyMedia'
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  "/:id/media",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema }),
  ...propertyController.uploadMedia,
);

/**
 * @swagger
 * /properties/{id}/media/{mediaId}:
 *   delete:
 *     operationId: deletePropertyMedia
 *     summary: Delete property media
 *     description: Removes a media item from a property and deletes it from storage.
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *       - $ref: '#/components/parameters/MediaIdParam'
 *     responses:
 *       200:
 *         description: Media removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:id/media/:mediaId",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: mediaIdSchema }),
  asyncHandler(propertyController.removeMedia),
);

export default router;
