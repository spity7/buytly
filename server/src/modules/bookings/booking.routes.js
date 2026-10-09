import { Router } from "express";
import { bookingController } from "./booking.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  listBookingsSchema,
  bookingIdSchema,
} from "./booking.validation.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /bookings:
 *   post:
 *     operationId: createBooking
 *     summary: Request a property visit
 *     description: Creates a visit booking request for an active property. Notifies the assigned agent.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
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
  "/",
  authorize(ROLES.BUYER),
  validate(createBookingSchema),
  asyncHandler(bookingController.create),
);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     operationId: getMyBookings
 *     summary: List buyer's bookings
 *     description: Returns paginated visit bookings for the authenticated buyer.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/BookingStatus'
 *     responses:
 *       200:
 *         description: Buyer bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBookingsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/my",
  authorize(ROLES.BUYER),
  validate(listBookingsSchema, "query"),
  asyncHandler(bookingController.getMy),
);

/**
 * @swagger
 * /bookings/agent:
 *   get:
 *     operationId: getAgentBookings
 *     summary: List agent's bookings
 *     description: Returns paginated visit requests assigned to the authenticated user (owner, agent, or admin when acting as listing contact).
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/BookingStatus'
 *     responses:
 *       200:
 *         description: Agent bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBookingsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/agent",
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(listBookingsSchema, "query"),
  asyncHandler(bookingController.getAgent),
);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     operationId: updateBookingStatus
 *     summary: Update booking status
 *     description: Assigned listing contact (owner or agent) or admin approves, rejects, or completes a booking. Notifies the buyer.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingStatusRequest'
 *     responses:
 *       200:
 *         description: Booking status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
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
  "/:id/status",
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({
    params: bookingIdSchema,
    body: updateBookingStatusSchema,
  }),
  asyncHandler(bookingController.updateStatus),
);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     operationId: cancelBooking
 *     summary: Cancel a booking
 *     description: Buyer cancels a pending booking. Notifies the agent.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
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
  "/:id/cancel",
  authorize(ROLES.BUYER),
  validateMultiple({ params: bookingIdSchema }),
  asyncHandler(bookingController.cancel),
);

export default router;
