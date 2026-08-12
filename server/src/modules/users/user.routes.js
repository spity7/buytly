import { Router } from "express";
import { userController } from "./user.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";
import { validate, validateMultiple } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  updateSocialLinksSchema,
  updatePreferencesSchema,
  savedSearchSchema,
  userIdParamSchema,
  savedSearchIdParamSchema,
  deleteAccountSchema,
} from "./user.validation.js";

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     operationId: getCurrentUser
 *     summary: Get current user profile
 *     description: Returns the authenticated user's full profile including preferences and avatar signed URL.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/me", authenticate, asyncHandler(userController.getMe));

/**
 * @swagger
 * /users/me:
 *   patch:
 *     operationId: updateCurrentUser
 *     summary: Update current user profile
 *     description: Updates firstName, lastName, and/or phone for the authenticated user.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 example: John
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 example: Doe
 *               phoneCountryCode:
 *                 type: string
 *                 example: '+961'
 *               phoneNumber:
 *                 type: string
 *                 example: '501234567'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile),
);

/**
 * @swagger
 * /users/me/social-links:
 *   patch:
 *     operationId: updateUserSocialLinks
 *     summary: Update social media links
 *     description: Updates the authenticated user's social media profile links.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSocialLinks'
 *     responses:
 *       200:
 *         description: Social links updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  "/me/social-links",
  authenticate,
  validate(updateSocialLinksSchema),
  asyncHandler(userController.updateSocialLinks),
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     operationId: deleteCurrentUser
 *     summary: Delete current user account (soft delete)
 *     description: Soft-deletes the account after password confirmation. Revokes all refresh tokens and anonymizes email.
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
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Account deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               success: true
 *               message: Account deleted successfully
 *               data:
 *                 message: Account deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *     operationId: updateUserPreferences
 *     summary: Update user preferences
 *     description: Updates search preferences (budget range, locations, property types).
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Preferences updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  "/me/preferences",
  authenticate,
  validate(updatePreferencesSchema),
  asyncHandler(userController.updatePreferences),
);

/**
 * @swagger
 * /users/me/saved-searches:
 *   post:
 *     operationId: addSavedSearch
 *     summary: Save a search filter
 *     description: Adds a named saved search with arbitrary filter criteria.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Dubai apartments under 500k
 *               filters:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   city: Dubai
 *                   maxPrice: 500000
 *                   type: apartment
 *     responses:
 *       201:
 *         description: Search saved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedSearch'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/me/saved-searches",
  authenticate,
  validate(savedSearchSchema),
  asyncHandler(userController.addSavedSearch),
);

/**
 * @swagger
 * /users/me/saved-searches:
 *   get:
 *     operationId: getSavedSearches
 *     summary: List saved searches
 *     description: Returns all saved searches for the authenticated user.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Saved searches list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedSearch'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/me/saved-searches",
  authenticate,
  asyncHandler(userController.getSavedSearches),
);

/**
 * @swagger
 * /users/me/saved-searches/{id}:
 *   delete:
 *     operationId: removeSavedSearch
 *     summary: Delete a saved search
 *     description: Removes a saved search by ID. Returns the updated list.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Search removed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SavedSearch'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
 *     operationId: uploadUserAvatar
 *     summary: Upload user avatar
 *     description: Uploads a profile avatar image (multipart/form-data). Replaces any existing avatar.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, or WebP)
 *     responses:
 *       200:
 *         description: Avatar uploaded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         avatar:
 *                           $ref: '#/components/schemas/Avatar'
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/me/avatar", authenticate, ...userController.uploadAvatar);

/**
 * @swagger
 * /users/me/avatar:
 *   delete:
 *     operationId: deleteUserAvatar
 *     summary: Remove user avatar
 *     description: Deletes the authenticated user's avatar from storage and clears the profile image.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         avatar:
 *                           nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete(
  "/me/avatar",
  authenticate,
  asyncHandler(userController.deleteAvatar),
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     operationId: getPublicUserProfile
 *     summary: Get public user profile
 *     description: Returns a limited public profile (name, role, avatar). No authentication required.
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/ObjectIdParam'
 *     responses:
 *       200:
 *         description: Public profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserPublicProfile'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  validateMultiple({ params: userIdParamSchema }),
  asyncHandler(userController.getPublicProfile),
);

export default router;
