import bcrypt from "bcrypt";
import { User } from "../users/user.model.js";
import { RefreshToken } from "./refreshToken.model.js";
import { AppError } from "../../shared/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashToken,
  generatePasswordResetToken,
} from "../../services/token.service.js";
import { emailService } from "../../services/email.service.js";
import { notificationService } from "../notifications/notification.service.js";
import { NOTIFICATION_TYPES } from "../../shared/constants.js";
import { env } from "../../config/env.js";

const SALT_ROUNDS = 12;

const issueTokenPair = async (user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
  });

  return { accessToken, refreshToken };
};

export const authService = {
  async register(data) {
    const existing = await User.findOne({ email: data.email, deletedAt: null });
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await User.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
    });

    const tokens = await issueTokenPair(user);

    notificationService
      .notify({
        userId: user._id,
        type: NOTIFICATION_TYPES.AUTH,
        title: "Welcome to Buytly",
        message: "Your account has been created successfully.",
        sendEmail: true,
        emailTemplate: "welcome",
        emailData: { name: user.firstName || user.email },
      })
      .catch(() => {});

    return {
      user: user.toPublicJSON(),
      ...tokens,
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email, deletedAt: null }).select(
      "+passwordHash",
    );

    if (!user || !user.isActive) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = await issueTokenPair(user);

    return {
      user: user.toPublicJSON(),
      ...tokens,
    };
  },

  async refresh(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash, revokedAt: null });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findOne({
      _id: stored.userId,
      deletedAt: null,
      isActive: true,
    });
    if (!user) {
      throw new AppError("User not found or inactive", 401);
    }

    stored.revokedAt = new Date();
    await stored.save();

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt: getRefreshTokenExpiry(),
    });

    stored.replacedByToken = newTokenHash;
    await stored.save();

    const accessToken = generateAccessToken(user._id, user.role);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: user.toPublicJSON(),
    };
  },

  async logout(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.updateOne({ tokenHash }, { revokedAt: new Date() });
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
      return { message: "If the email exists, a reset link has been sent" };
    }

    const { token, hashed, expires } = generatePasswordResetToken();

    user.passwordResetToken = hashed;
    user.passwordResetExpires = expires;
    await user.save();

    const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

    await emailService.sendPasswordReset(user.email, {
      name: user.firstName || user.email,
      resetUrl,
    });

    return { message: "If the email exists, a reset link has been sent" };
  },

  async resetPassword(token, password) {
    const hashed = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
      deletedAt: null,
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id },
      { revokedAt: new Date() },
    );

    return { message: "Password reset successfully" };
  },
};
