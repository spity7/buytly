import { Router } from "express";
import { propertyController } from "./property.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  authenticate,
  authorize,
  optionalAuth,
} from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesSchema,
  listMyPropertiesSchema,
  propertyIdSchema,
  mediaIdSchema,
} from "./property.validation.js";
import propertyReviewRoutes from "../property-reviews/property-review.routes.js";

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
 *           type: string
 *           enum: [active, sold, rented]
 *         description: Defaults to active. Draft, pending, and archived are not exposed on the public list.
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
 *         description: Case-insensitive partial match on title and description. Can be combined with geo-radius filters.
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
 * /properties/mine:
 *   get:
 *     operationId: listMyProperties
 *     summary: List current user's properties
 *     description: Returns paginated properties owned by or assigned to the authenticated user (seller, agent, or admin).
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/PropertyStatus'
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/PropertyType'
 *       - in: query
 *         name: listingType
 *         schema:
 *           $ref: '#/components/schemas/ListingType'
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive partial match on title and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, viewCount]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: trashed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: When true, returns soft-deleted listings in trash.
 *     responses:
 *       200:
 *         description: Paginated property list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPropertiesResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/mine",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(listMyPropertiesSchema, "query"),
  asyncHandler(propertyController.listMine),
);

router.use("/:id/reviews", propertyReviewRoutes);

/**
 * @swagger
 * /properties/{id}/nearby:
 *   get:
 *     operationId: getPropertyNearby
 *     summary: Get nearby points of interest
 *     description: Returns schools, medical facilities, and transit stops within 5 km of the property using OpenStreetMap data. Cached for 24 hours per location. Same visibility rules as GET /properties/{id}.
 *     tags: [Properties]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Nearby places grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyNearbySuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id/nearby",
  optionalAuth,
  validateMultiple({ params: propertyIdSchema }),
  asyncHandler(propertyController.getNearby),
);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     operationId: getPropertyById
 *     summary: Get property by ID
 *     description: Returns full property details with media signed URLs. Increments view count for active listings. Non-active listings are only visible to the owner, assigned agent, or admin.
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
  optionalAuth,
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
 * /properties/{id}/restore:
 *   patch:
 *     operationId: restoreProperty
 *     summary: Restore a soft-deleted property
 *     description: Clears deletedAt and sets status to draft. Owner, assigned agent, or admin only.
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Property restored
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertySuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/restore",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema }),
  asyncHandler(propertyController.restore),
);

/**
 * @swagger
 * /properties/{id}/media:
 *   post:
 *     operationId: uploadPropertyMedia
 *     summary: Upload property media
 *     description: Uploads an image or a single listing video for a property (multipart/form-data field `media`). Each property may have many images but at most one video; uploading a second video returns 400.
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

/**
 * @swagger
 * /properties/{id}/floor-plans/image:
 *   post:
 *     operationId: uploadFloorPlanImage
 *     summary: Upload floor plan image
 *     description: Uploads a floor plan image and returns a gcsKey for use in the floorPlans array.
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
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Floor plan image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FloorPlanImageUpload'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  "/:id/floor-plans/image",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: propertyIdSchema }),
  ...propertyController.uploadFloorPlanImage,
);

export default router;
