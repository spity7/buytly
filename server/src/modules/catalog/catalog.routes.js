import { Router } from "express";
import { catalogController } from "./catalog.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { nearbyPreviewSchema } from "./catalog.validation.js";

const router = Router();

/**
 * @swagger
 * /catalog/property-types:
 *   get:
 *     operationId: listCatalogPropertyTypes
 *     summary: List active property types
 *     description: Returns property type options for listings and filters.
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: Property type list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CatalogPropertyType'
 */
router.get(
  "/property-types",
  asyncHandler(catalogController.listPropertyTypes),
);

/**
 * @swagger
 * /catalog/amenities:
 *   get:
 *     operationId: listCatalogAmenities
 *     summary: List active amenities
 *     description: Returns amenity options for property forms.
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: Amenity list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CatalogAmenity'
 */
router.get("/amenities", asyncHandler(catalogController.listAmenities));

/**
 * @swagger
 * /catalog/nearby:
 *   get:
 *     operationId: getCatalogNearbyPreview
 *     summary: Preview nearby POIs by coordinates
 *     description: Returns schools, medical facilities, and transit within 5 km (OpenStreetMap). Used before a listing is saved.
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Nearby categories
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PropertyNearbyData'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/nearby",
  validate(nearbyPreviewSchema, "query"),
  asyncHandler(catalogController.getNearbyPreview),
);

export default router;
