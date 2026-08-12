import { Router } from "express";
import { authController } from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  changePasswordSchema,
} from "./auth.validation.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     operationId: registerUser
 *     summary: Register a new user
 *     description: Creates a buyer, seller, or agent account. Returns JWT tokens and sends a verification email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             buyer:
 *               summary: Register as buyer
 *               value:
 *                 email: john@example.com
 *                 password: SecurePass123
 *                 confirmPassword: SecurePass123
 *                 firstName: John
 *                 lastName: Doe
 *                 role: buyer
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     operationId: loginUser
 *     summary: Login user
 *     description: Authenticates with email and password. Returns JWT access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     operationId: refreshToken
 *     summary: Refresh access token
 *     description: Exchanges a valid refresh token for a new access/refresh token pair. The old refresh token is revoked.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(authController.refresh),
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     operationId: logoutUser
 *     summary: Logout user
 *     description: Revokes the provided refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Logged out successfully
 *               data: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/logout",
  validate(logoutSchema),
  asyncHandler(authController.logout),
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     operationId: forgotPassword
 *     summary: Request password reset
 *     description: Sends a password reset email if the account exists. Always returns the same message to prevent email enumeration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset email sent if account exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     operationId: resetPassword
 *     summary: Reset password with token
 *     description: Sets a new password using the token from the reset email. Revokes all existing refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: NewSecurePass456
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               success: true
 *               message: Password reset successfully
 *               data:
 *                 message: Password reset successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     operationId: verifyEmail
 *     summary: Verify email address with token
 *     description: Marks the user's email as verified using the token from the verification email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456
 *     responses:
 *       200:
 *         description: Email verified
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
 *                         message:
 *                           type: string
 *                           example: Email verified successfully
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/verify-email",
  authRateLimiter,
  validate(verifyEmailSchema),
  asyncHandler(authController.verifyEmail),
);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     operationId: resendVerification
 *     summary: Resend email verification link
 *     description: Resends verification email for unverified accounts. Always returns the same message to prevent email enumeration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Verification email sent if applicable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post(
  "/resend-verification",
  authRateLimiter,
  validate(resendVerificationSchema),
  asyncHandler(authController.resendVerification),
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     operationId: changePassword
 *     summary: Change password
 *     description: Changes the authenticated user's password after verifying the current password.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmNewPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldSecurePass123
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: NewSecurePass456
 *               confirmNewPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: NewSecurePass456
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);

export default router;
