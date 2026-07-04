import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import {
  listNotificationsSchema,
  notificationIdSchema,
} from "./notification.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications
 */

router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List user notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: unread
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get(
  "/",
  validate(listNotificationsSchema, "query"),
  asyncHandler(notificationController.list),
);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get("/unread-count", asyncHandler(notificationController.unreadCount));

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.patch("/read-all", asyncHandler(notificationController.markAllRead));

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.patch(
  "/:id/read",
  validateMultiple({ params: notificationIdSchema }),
  asyncHandler(notificationController.markRead),
);

export default router;
