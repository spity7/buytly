import { Router } from "express";
import { propertyReviewController } from "./property-review.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, optionalAuth } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import {
  createPropertyReviewSchema,
  listPropertyReviewsSchema,
  propertyReviewParamsSchema,
  propertyReviewIdParamsSchema,
} from "./property-review.validation.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /properties/{id}/reviews:
 *   get:
 *     operationId: listPropertyReviews
 *     summary: List property reviews
 *     description: Returns paginated reviews for a viewable property (same visibility as GET /properties/:id) with aggregate rating stats.
 *     tags: [Property Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Property reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPropertyReviewsResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/",
  optionalAuth,
  validate(listPropertyReviewsSchema, "query"),
  asyncHandler(propertyReviewController.list),
);

/**
 * @swagger
 * /properties/{id}/reviews/check:
 *   get:
 *     operationId: checkPropertyReview
 *     summary: Check if current user reviewed property
 *     description: Returns whether the authenticated user has already submitted a review for this property.
 *     tags: [Property Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Review status for current user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PropertyReviewCheckData'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/check",
  optionalAuth,
  asyncHandler(propertyReviewController.checkMine),
);

/**
 * @swagger
 * /properties/{id}/reviews:
 *   post:
 *     operationId: createPropertyReview
 *     summary: Submit a property review
 *     description: Creates a review for an active property. One review per user per property.
 *     tags: [Property Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyReviewRequest'
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PropertyReview'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  "/",
  authenticate,
  validate(createPropertyReviewSchema),
  asyncHandler(propertyReviewController.create),
);

/**
 * @swagger
 * /properties/{id}/reviews/{reviewId}:
 *   delete:
 *     operationId: deletePropertyReview
 *     summary: Delete a property review
 *     description: Review author or admin can delete a review.
 *     tags: [Property Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 *     responses:
 *       200:
 *         description: Review deleted
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
  "/:reviewId",
  authenticate,
  validateMultiple({ params: propertyReviewIdParamsSchema }),
  asyncHandler(propertyReviewController.remove),
);

export default router;
