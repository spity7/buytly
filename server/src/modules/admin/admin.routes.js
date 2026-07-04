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

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel APIs
 */

router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 */
router.get(
  "/users",
  validate(listUsersSchema, "query"),
  asyncHandler(adminController.listUsers),
);

router.patch(
  "/users/:id/status",
  validateMultiple({ params: userIdSchema, body: updateUserStatusSchema }),
  asyncHandler(adminController.updateUserStatus),
);

router.patch(
  "/users/:id/role",
  validateMultiple({ params: userIdSchema, body: updateUserRoleSchema }),
  asyncHandler(adminController.updateUserRole),
);

router.get(
  "/properties",
  validate(listAdminPropertiesSchema, "query"),
  asyncHandler(adminController.listProperties),
);

router.patch(
  "/properties/:id/moderate",
  validateMultiple({ params: propertyIdSchema, body: moderatePropertySchema }),
  asyncHandler(adminController.moderateProperty),
);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get platform analytics KPIs
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get("/analytics", asyncHandler(adminController.getAnalytics));

export default router;
