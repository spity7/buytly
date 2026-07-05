import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  listUsersSchema,
  userIdSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  listAdminPropertiesSchema,
  propertyIdSchema,
  moderatePropertySchema,
} from "./admin.validation.js";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     operationId: adminListUsers
 *     summary: List all users
 *     description: Returns a paginated list of all users. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: role
 *         schema:
 *           $ref: '#/components/schemas/UserRole'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: User list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/users",
  validate(listUsersSchema, "query"),
  asyncHandler(adminController.listUsers),
);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     operationId: adminUpdateUserStatus
 *     summary: Activate or deactivate a user
 *     description: Sets a user's isActive flag. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSuccessResponse'
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
  "/users/:id/status",
  validateMultiple({ params: userIdSchema, body: updateUserStatusSchema }),
  asyncHandler(adminController.updateUserStatus),
);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     operationId: adminUpdateUserRole
 *     summary: Change a user's role
 *     description: Updates a user's role. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 $ref: '#/components/schemas/UserRole'
 *     responses:
 *       200:
 *         description: User role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSuccessResponse'
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
  "/users/:id/role",
  validateMultiple({ params: userIdSchema, body: updateUserRoleSchema }),
  asyncHandler(adminController.updateUserRole),
);

/**
 * @swagger
 * /admin/properties:
 *   get:
 *     operationId: adminListProperties
 *     summary: List all properties (admin)
 *     description: Returns all listings including drafts and pending. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/PropertyStatus'
 *     responses:
 *       200:
 *         description: Property list
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
  "/properties",
  validate(listAdminPropertiesSchema, "query"),
  asyncHandler(adminController.listProperties),
);

/**
 * @swagger
 * /admin/properties/{id}/moderate:
 *   patch:
 *     operationId: adminModerateProperty
 *     summary: Moderate a property listing
 *     description: Changes property status (e.g. approve pending listing to active). Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/PropertyStatus'
 *     responses:
 *       200:
 *         description: Property moderated
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
  "/properties/:id/moderate",
  validateMultiple({ params: propertyIdSchema, body: moderatePropertySchema }),
  asyncHandler(adminController.moderateProperty),
);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     operationId: getAnalytics
 *     summary: Get platform analytics KPIs
 *     description: Returns dashboard analytics including users by role, listings, bookings, transactions, and top cities. Cached for 10 minutes.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AnalyticsData'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/analytics", asyncHandler(adminController.getAnalytics));

export default router;
