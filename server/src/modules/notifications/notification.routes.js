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

router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     operationId: listNotifications
 *     summary: List user notifications
 *     description: Returns paginated in-app notifications. Use `unread=true` for unread only or `unread=false` for read only.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: unread
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by read status. Omit for all notifications.
 *     responses:
 *       200:
 *         description: Notifications list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedNotificationsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *     operationId: getUnreadNotificationCount
 *     summary: Get unread notification count
 *     description: Returns the number of unread notifications for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UnreadCountData'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/unread-count", asyncHandler(notificationController.unreadCount));

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     operationId: markAllNotificationsRead
 *     summary: Mark all notifications as read
 *     description: Marks every unread notification as read for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: All notifications marked as read
 *               data: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch("/read-all", asyncHandler(notificationController.markAllRead));

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     operationId: markNotificationRead
 *     summary: Mark notification as read
 *     description: Marks a single notification as read. Idempotent — re-marking does not change readAt.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Marked as read
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/read",
  validateMultiple({ params: notificationIdSchema }),
  asyncHandler(notificationController.markRead),
);

export default router;
