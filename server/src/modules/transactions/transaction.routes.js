import { Router } from "express";
import { transactionController } from "./transaction.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
  listTransactionsSchema,
  transactionIdSchema,
} from "./transaction.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Buy and rent transaction tracking
 */

router.use(authenticate);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Initiate a transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post(
  "/",
  authorize(ROLES.BUYER),
  validate(createTransactionSchema),
  asyncHandler(transactionController.create),
);

router.get(
  "/my",
  validate(listTransactionsSchema, "query"),
  asyncHandler(transactionController.getMy),
);

router.get(
  "/:id",
  validateMultiple({ params: transactionIdSchema }),
  asyncHandler(transactionController.getById),
);

router.patch(
  "/:id/status",
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({
    params: transactionIdSchema,
    body: updateTransactionStatusSchema,
  }),
  asyncHandler(transactionController.updateStatus),
);

export default router;
