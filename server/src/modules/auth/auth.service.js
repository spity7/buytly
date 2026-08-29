import bcrypt from "bcrypt";
import { User } from "../users/user.model.js";
import { AgentProfile } from "../agents/agent.model.js";
import { RefreshToken } from "./refreshToken.model.js";
import { AppError } from "../../shared/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
} from "../../services/token.service.js";
import { applyPhoneFields } from "../../shared/phone.js";
import { emailService } from "../../services/email.service.js";
import { notificationService } from "../notifications/notification.service.js";
import { NOTIFICATION_TYPES, ROLES } from "../../shared/constants.js";
import { env } from "../../config/env.js";
import { googleService } from "../../services/google.service.js";

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

const sendVerificationEmail = async (user, plainToken) => {
  const verifyUrl = `${env.APP_URL}/verify-email?token=${plainToken}`;
  await emailService.sendEmailVerification(user.email, {
    name: user.firstName || user.email,
    verifyUrl,
  });
};

const setEmailVerificationToken = async (user) => {
  const { token, hashed, expires } = generateEmailVerificationToken();
  user.emailVerificationToken = hashed;
  user.emailVerificationExpires = expires;
  await user.save();
  return token;
};

const handleDuplicateEmailError = (err) => {
  if (err.code === 11000) {
    throw new AppError("Email already registered", 409);
  }
  throw err;
};

const verifyEmailFromGoogle = (user) => {
  if (user.isEmailVerified) return false;

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  return true;
};

const applyGoogleProfileFields = (user, profile) => {
  if (!user.firstName && profile.firstName) user.firstName = profile.firstName;
  if (!user.lastName && profile.lastName) user.lastName = profile.lastName;
};

const resolveAuthProviderAfterGoogleLink = (user) =>
  user.passwordHash ? "both" : "google";

const linkGoogleToExistingUser = (user, profile) => {
  if (user.googleId && user.googleId !== profile.googleId) {
    throw new AppError(
      "This account is linked to a different Google account",
      409,
    );
  }

  user.googleId = profile.googleId;
  user.authProvider = resolveAuthProviderAfterGoogleLink(user);
  applyGoogleProfileFields(user, profile);
  verifyEmailFromGoogle(user);
};

export const authService = {
  async register(data) {
    const existing = await User.findOne({ email: data.email, deletedAt: null });
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const {
      token: verificationToken,
      hashed,
      expires,
    } = generateEmailVerificationToken();

    let user;
    try {
      user = new User({
        email: data.email,
        passwordHash,
        authProvider: "local",
        firstName: data.firstName,
        lastName: data.lastName,
        phoneCountryCode: data.phoneCountryCode,
        phoneNumber: data.phoneNumber,
        role: data.role,
        emailVerificationToken: hashed,
        emailVerificationExpires: expires,
      });
      applyPhoneFields(user, {
        phoneCountryCode: data.phoneCountryCode,
        phoneNumber: data.phoneNumber,
      });
      await user.save();
    } catch (err) {
      handleDuplicateEmailError(err);
    }

    if (data.role === ROLES.AGENT) {
      await AgentProfile.create({ userId: user._id });
    }

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
      .catch((err) =>
        console.error("Registration notification failed:", err.message),
      );

    sendVerificationEmail(user, verificationToken).catch((err) =>
      console.error("Verification email failed:", err.message),
    );

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

    if (!user.passwordHash) {
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

  async googleAuth({ idToken, role = ROLES.BUYER }) {
    const profile = await googleService.verifyIdToken(idToken);

    if (!profile.emailVerified) {
      throw new AppError("Google email is not verified", 401);
    }

    let user = await User.findOne({
      googleId: profile.googleId,
      deletedAt: null,
    }).select(
      "+googleId +emailVerificationToken +emailVerificationExpires +passwordHash",
    );

    if (user) {
      if (!user.isActive) {
        throw new AppError("Account inactive", 401);
      }

      if (verifyEmailFromGoogle(user)) {
        await user.save();
      }

      const tokens = await issueTokenPair(user);
      return {
        user: user.toPublicJSON(),
        ...tokens,
      };
    }

    const existingByEmail = await User.findOne({
      email: profile.email,
      deletedAt: null,
    }).select(
      "+googleId +passwordHash +emailVerificationToken +emailVerificationExpires",
    );

    if (existingByEmail) {
      if (!existingByEmail.isActive) {
        throw new AppError("Account inactive", 401);
      }

      linkGoogleToExistingUser(existingByEmail, profile);
      await existingByEmail.save();

      const tokens = await issueTokenPair(existingByEmail);
      return {
        user: existingByEmail.toPublicJSON(),
        ...tokens,
      };
    }

    try {
      user = new User({
        email: profile.email,
        googleId: profile.googleId,
        authProvider: "google",
        firstName: profile.firstName,
        lastName: profile.lastName,
        role,
        isEmailVerified: true,
      });
      await user.save();
    } catch (err) {
      handleDuplicateEmailError(err);
    }

    if (role === ROLES.AGENT) {
      await AgentProfile.create({ userId: user._id });
    }

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
      .catch((err) =>
        console.error("Registration notification failed:", err.message),
      );

    return {
      user: user.toPublicJSON(),
      ...tokens,
    };
  },

  async verifyEmail(token) {
    const hashed = hashToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: new Date() },
      deletedAt: null,
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return {
      message: "Email verified successfully",
      user: user.toPublicJSON(),
    };
  },

  async resendVerification(email) {
    const user = await User.findOne({
      email,
      deletedAt: null,
      isActive: true,
      isEmailVerified: false,
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (user) {
      const token = await setEmailVerificationToken(user);
      await sendVerificationEmail(user, token);
    }

    return {
      message:
        "If the email exists and is unverified, a verification link has been sent",
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
    if (user.authProvider === "google") {
      user.authProvider = "both";
    }
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id },
      { revokedAt: new Date() },
    );

    return { message: "Password reset successfully" };
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user || user.deletedAt) {
      throw new AppError("User not found", 404);
    }

    if (user.authProvider === "google") {
      throw new AppError(
        "Password change is not available for Google sign-in accounts",
        400,
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { message: "Password changed successfully" };
  },
};
