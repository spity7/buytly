import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { contactRateLimiter } from "../../middleware/rateLimit.js";
import { contactController } from "./contact.controller.js";
import { submitContactSchema } from "./contact.validation.js";

const router = Router();

/**
 * @swagger
 * /contact:
 *   post:
 *     operationId: submitContactInquiry
 *     summary: Submit a public contact form message
 *     description: Sends the inquiry to the configured support inbox and an auto-reply to the submitter.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitContactRequest'
 *     responses:
 *       201:
 *         description: Message accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/",
  contactRateLimiter,
  validate(submitContactSchema),
  asyncHandler(contactController.submit),
);

export default router;
