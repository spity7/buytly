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
 *       - in: query
 *         name: deleted
 *         schema:
 *           type: string
 *           enum: ['true', 'false', 'all']
 *           default: 'false'
 *         description: Filter by deletion status (`false` = active users only, `true` = deleted only, `all` = include both)
 *     responses:
 *       200:
 *         description: User list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAdminUsersResponse'
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
 * /admin/users/{id}:
 *   get:
 *     operationId: adminGetUserById
 *     summary: Get user details (admin)
 *     description: Returns a user profile with related record counts. Includes soft-deleted users. Listings remain live after account deletion — activeListings reflects public listings still visible.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: User detail with related counts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserDetailResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/users/:id",
  validate(userIdSchema, "params"),
  asyncHandler(adminController.getUserById),
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
 *     description: Returns platform analytics including users by role, listings, bookings, transactions, and top cities. Cached for 10 minutes.
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
