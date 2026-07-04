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

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Property visit scheduling
 */

router.use(authenticate);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Request a property visit
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post(
  "/",
  authorize(ROLES.BUYER),
  validate(createBookingSchema),
  asyncHandler(bookingController.create),
);

router.get(
  "/my",
  authorize(ROLES.BUYER),
  validate(listBookingsSchema, "query"),
  asyncHandler(bookingController.getMy),
);

router.get(
  "/agent",
  authorize(ROLES.AGENT),
  validate(listBookingsSchema, "query"),
  asyncHandler(bookingController.getAgent),
);

router.patch(
  "/:id/status",
  authorize(ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({
    params: bookingIdSchema,
    body: updateBookingStatusSchema,
  }),
  asyncHandler(bookingController.updateStatus),
);

router.patch(
  "/:id/cancel",
  authorize(ROLES.BUYER),
  validateMultiple({ params: bookingIdSchema }),
  asyncHandler(bookingController.cancel),
);

export default router;
