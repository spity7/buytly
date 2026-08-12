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
 * /agents:
 *   get:
 *     operationId: listAgents
 *     summary: List agents
 *     description: Returns a paginated list of agent profiles sorted by rating.
 *     tags: [Agents]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         example: Dubai
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         example: luxury
 *     responses:
 *       200:
 *         description: Agent list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAgentsResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  "/",
  validate(listAgentsSchema, "query"),
  asyncHandler(agentController.list),
);

/**
 * @swagger
 * /agents/me:
 *   patch:
 *     operationId: updateMyAgentProfile
 *     summary: Update own agent profile
 *     description: Updates the authenticated agent's extended profile (license, agency, bio, etc.).
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licenseNumber:
 *                 type: string
 *                 maxLength: 50
 *                 example: RE-12345
 *               agency:
 *                 type: string
 *                 maxLength: 100
 *                 example: Buytly Realty
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *                 example: 10+ years experience in luxury properties.
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [luxury, commercial]
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: Dubai
 *     responses:
 *       200:
 *         description: Agent profile updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AgentProfile'
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
  "/me",
  authenticate,
  authorize(ROLES.AGENT),
  validate(updateAgentProfileSchema),
  asyncHandler(agentController.updateMyProfile),
);

/**
 * @swagger
 * /agents/me:
 *   get:
 *     operationId: getMyAgentProfile
 *     summary: Get own agent profile
 *     description: Returns the authenticated agent's user info, extended profile, and active listings count.
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AgentDetail'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/me",
  authenticate,
  authorize(ROLES.AGENT),
  asyncHandler(agentController.getMyProfile),
);

/**
 * @swagger
 * /agents/{id}:
 *   get:
 *     operationId: getAgentById
 *     summary: Get agent profile
 *     description: Returns agent user info, extended profile, and active listings count.
 *     tags: [Agents]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Agent profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AgentDetail'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  validateMultiple({ params: agentIdSchema }),
  asyncHandler(agentController.getById),
);

/**
 * @swagger
 * /agents/{id}/properties:
 *   get:
 *     operationId: getAgentProperties
 *     summary: List agent's properties
 *     description: Returns a paginated list of active properties listed by the agent.
 *     tags: [Agents]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/PropertyType'
 *       - in: query
 *         name: listingType
 *         schema:
 *           $ref: '#/components/schemas/ListingType'
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, viewCount]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Agent property list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPropertiesResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id/properties",
  validateMultiple({ params: agentIdSchema, query: listPropertiesSchema }),
  asyncHandler(agentController.getProperties),
);

export default router;
