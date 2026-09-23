import { Router } from "express";
import { projectController } from "./project.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  authenticate,
  authorize,
  optionalAuth,
} from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import { ROLES } from "../../shared/constants.js";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  listMyProjectsSchema,
  projectIdSchema,
  projectMediaIdSchema,
  reorderProjectMediaSchema,
} from "./project.validation.js";

const router = Router();

/**
 * @swagger
 * /projects:
 *   get:
 *     operationId: listProjects
 *     summary: List projects with filters
 *     tags: [Projects]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated project list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProjectsResponse'
 */
router.get(
  "/",
  validate(listProjectsSchema, "query"),
  asyncHandler(projectController.list),
);

/**
 * @swagger
 * /projects/mine:
 *   get:
 *     operationId: listMyProjects
 *     summary: List current user's projects
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/PropertyStatus'
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, viewCount, title]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: trashed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Paginated project list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProjectsResponse'
 */
router.get(
  "/mine",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(listMyProjectsSchema, "query"),
  asyncHandler(projectController.listMine),
);

/**
 * @swagger
 * /projects/slug/{slug}:
 *   get:
 *     operationId: getProjectBySlug
 *     summary: Get project by slug with units
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  "/slug/:slug",
  optionalAuth,
  asyncHandler(projectController.getBySlug),
);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     operationId: getProjectById
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *       - in: query
 *         name: includeUnits
 *         schema:
 *           type: string
 *           enum: [true, false]
 */
router.get(
  "/:id",
  optionalAuth,
  validate(projectIdSchema, "params"),
  asyncHandler(projectController.getById),
);

/**
 * @swagger
 * /projects/{id}/properties:
 *   get:
 *     operationId: listProjectUnits
 *     summary: List units in a project
 *     tags: [Projects]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 */
router.get(
  "/:id/properties",
  optionalAuth,
  validate(projectIdSchema, "params"),
  asyncHandler(projectController.listUnits),
);

/**
 * @swagger
 * /projects:
 *   post:
 *     operationId: createProject
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(createProjectSchema),
  asyncHandler(projectController.create),
);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     operationId: updateProject
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     operationId: deleteProject
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Project deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({ params: projectIdSchema, body: updateProjectSchema }),
  asyncHandler(projectController.update),
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(projectIdSchema, "params"),
  asyncHandler(projectController.remove),
);

/**
 * @swagger
 * /projects/{id}/restore:
 *   patch:
 *     operationId: restoreProject
 *     summary: Restore archived project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 */
router.patch(
  "/:id/restore",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(projectIdSchema, "params"),
  asyncHandler(projectController.restore),
);

/**
 * @swagger
 * /projects/{id}/permanent:
 *   delete:
 *     operationId: permanentlyDeleteProject
 *     summary: Permanently delete a trashed project
 *     description: Removes the project, its units, media, and non-blocking related records. Requires the project to be in trash. Blocked when any unit has open bookings or transaction history.
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Project permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.delete(
  "/:id/permanent",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(projectIdSchema, "params"),
  asyncHandler(projectController.permanentRemove),
);

/**
 * @swagger
 * /projects/{id}/media:
 *   post:
 *     operationId: uploadProjectMedia
 *     summary: Upload project media
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [media]
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media uploaded
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
  "/:id/media",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(projectIdSchema, "params"),
  ...projectController.uploadMedia,
);

/**
 * @swagger
 * /projects/{id}/media/{mediaId}:
 *   delete:
 *     operationId: deleteProjectMedia
 *     summary: Remove project media
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ObjectId'
 */
router.delete(
  "/:id/media/:mediaId",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validate(projectMediaIdSchema, "params"),
  asyncHandler(projectController.removeMedia),
);

/**
 * @swagger
 * /projects/{id}/media/order:
 *   put:
 *     operationId: reorderProjectMedia
 *     summary: Reorder project photos
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageIds]
 *             properties:
 *               imageIds:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ObjectId'
 *     responses:
 *       200:
 *         description: Media order updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  "/:id/media/order",
  authenticate,
  authorize(ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN),
  validateMultiple({
    params: projectIdSchema,
    body: reorderProjectMediaSchema,
  }),
  asyncHandler(projectController.reorderMedia),
);

export default router;
