import { Router } from "express";
import { userController } from "./user.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  savedSearchSchema,
  userIdParamSchema,
  savedSearchIdParamSchema,
  deleteAccountSchema,
} from "./user.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/me", authenticate, asyncHandler(userController.getMe));

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile),
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user account (soft delete)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete(
  "/me",
  authenticate,
  validate(deleteAccountSchema),
  asyncHandler(userController.deleteAccount),
);

/**
 * @swagger
 * /users/me/preferences:
 *   patch:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.patch(
  "/me/preferences",
  authenticate,
  validate(updatePreferencesSchema),
  asyncHandler(userController.updatePreferences),
);

router.post(
  "/me/saved-searches",
  authenticate,
  validate(savedSearchSchema),
  asyncHandler(userController.addSavedSearch),
);

router.get(
  "/me/saved-searches",
  authenticate,
  asyncHandler(userController.getSavedSearches),
);

router.delete(
  "/me/saved-searches/:id",
  authenticate,
  validateMultiple({ params: savedSearchIdParamSchema }),
  asyncHandler(userController.removeSavedSearch),
);

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 */
router.post("/me/avatar", authenticate, ...userController.uploadAvatar);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get public user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public profile
 */
router.get(
  "/:id",
  validateMultiple({ params: userIdParamSchema }),
  asyncHandler(userController.getPublicProfile),
);

export default router;
