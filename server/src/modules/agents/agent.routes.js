import { Router } from "express";
import { agentController } from "./agent.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  updateAgentProfileSchema,
  listAgentsSchema,
  agentIdSchema,
} from "./agent.validation.js";
import { listPropertiesSchema } from "../properties/property.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: Real estate agent profiles
 */

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: List agents
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: specialty
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Agent list
 */
router.get(
  "/",
  validate(listAgentsSchema, "query"),
  asyncHandler(agentController.list),
);

router.patch(
  "/me",
  authenticate,
  authorize(ROLES.AGENT),
  validate(updateAgentProfileSchema),
  asyncHandler(agentController.updateMyProfile),
);

/**
 * @swagger
 * /agents/{id}:
 *   get:
 *     summary: Get agent profile
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Agent profile
 */
router.get(
  "/:id",
  validateMultiple({ params: agentIdSchema }),
  asyncHandler(agentController.getById),
);

router.get(
  "/:id/properties",
  validateMultiple({ params: agentIdSchema, query: listPropertiesSchema }),
  asyncHandler(agentController.getProperties),
);

export default router;
