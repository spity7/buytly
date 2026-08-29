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

router.use(authenticate);

/**
 * @swagger
 * /transactions:
 *   post:
 *     operationId: createTransaction
 *     summary: Initiate a transaction
 *     description: Buyer initiates a buy or rent transaction for an active property. Notifies seller and agent.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Transaction'
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
  validate(createTransactionSchema),
  asyncHandler(transactionController.create),
);

/**
 * @swagger
 * /transactions/my:
 *   get:
 *     operationId: getMyTransactions
 *     summary: List user's transactions
 *     description: Returns transactions where the user is buyer, seller, or agent.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/TransactionStatus'
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/TransactionType'
 *     responses:
 *       200:
 *         description: User transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTransactionsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/my",
  validate(listTransactionsSchema, "query"),
  asyncHandler(transactionController.getMy),
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     operationId: getTransactionById
 *     summary: Get transaction details
 *     description: Returns full transaction details. Only accessible by transaction parties.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Transaction detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Transaction'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  validateMultiple({ params: transactionIdSchema }),
  asyncHandler(transactionController.getById),
);

/**
 * @swagger
 * /transactions/{id}/status:
 *   patch:
 *     operationId: updateTransactionStatus
 *     summary: Update transaction status
 *     description: Seller, agent, or admin updates transaction status. Completing marks the property as sold/rented.
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionStatusRequest'
 *     responses:
 *       200:
 *         description: Transaction status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Transaction'
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
    params: transactionIdSchema,
    body: updateTransactionStatusSchema,
  }),
  asyncHandler(transactionController.updateStatus),
);

export default router;
