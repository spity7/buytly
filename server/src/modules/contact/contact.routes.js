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
 *     description: Stores the inquiry for the current site (listed via `GET /admin/inquiries`), then emails the site's contact inbox (`branding.contactInboxEmail`, falling back to `CONTACT_INBOX_EMAIL`) and sends an auto-reply to the submitter. Email failures are logged and still return 201. A filled `website` honeypot returns the same 201 without storing or emailing.
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
