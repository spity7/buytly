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
import { ROLES } from "../../shared/constants.js";
import { googleService } from "../../services/google.service.js";
import { syncGoogleAvatarIfMissing } from "../../services/googleAvatar.service.js";
import { buildSiteLink } from "../../services/siteBrand.js";
import { getRequestSiteId } from "../../shared/requestContext.js";

const SALT_ROUNDS = 12;

const issueTokenPair = async (user) => {
  const siteId = user.siteId ?? getRequestSiteId();
  const accessToken = generateAccessToken(user._id, user.role, siteId);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    siteId,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
  });

  return { accessToken, refreshToken };
};

// Links open the request site's frontend so users finish the flow on the
// site they signed up on (accounts are per site).
const sendVerificationEmail = async (user, plainToken) => {
  const verifyUrl = buildSiteLink(`/verify-email?token=${plainToken}`);
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

const normalizeAuthEmail = (email) => email?.toLowerCase()?.trim() ?? "";

const duplicateKeyAppError = (err) => {
  const keyPattern = err.keyPattern || {};
  if (keyPattern.googleId) {
    return new AppError(
      "This Google account is already linked to another user on this site",
      409,
    );
  }
  return new AppError("Email already registered", 409);
};

const handleDuplicateEmailError = (err) => {
  if (err.code === 11000) {
    throw duplicateKeyAppError(err);
  }
  throw err;
};

const userSelectForGoogleAuth =
  "+googleId +emailVerificationToken +emailVerificationExpires +passwordHash";

const findActiveUserByGoogleId = (googleId, siteId) =>
  User.findOne({ googleId, siteId, deletedAt: null }).select(
    userSelectForGoogleAuth,
  );

const findActiveUserByEmail = (email, siteId) =>
  User.findOne({
    email: normalizeAuthEmail(email),
    siteId,
    deletedAt: null,
  }).select(userSelectForGoogleAuth);

const finishGoogleSignIn = async (user) => {
  const tokens = await issueTokenPair(user);
  return {
    user: user.toPublicJSON(),
    ...tokens,
  };
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

const linkGoogleToExistingUser = async (user, profile) => {
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
  await syncGoogleAvatarIfMissing(user, profile.picture);
};

export const authService = {
  async register(data) {
    const siteId = getRequestSiteId();
    const existing = await User.findOne({
      email: data.email,
      siteId,
      deletedAt: null,
    });
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
        siteId,
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
      .notifyFromEvent("auth.welcome", {
        userId: user._id,
        context: { name: user.firstName || user.email },
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
    const siteId = getRequestSiteId();
    const user = await User.findOne({ email, siteId, deletedAt: null }).select(
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

    const siteId = getRequestSiteId();

    let user = await findActiveUserByGoogleId(profile.googleId, siteId);

    if (user) {
      if (!user.isActive) {
        throw new AppError("Account inactive", 401);
      }

      const emailVerified = verifyEmailFromGoogle(user);
      const avatarSynced = await syncGoogleAvatarIfMissing(
        user,
        profile.picture,
      );
      if (emailVerified || avatarSynced) {
        await user.save();
      }

      return finishGoogleSignIn(user);
    }

    const existingByEmail = await findActiveUserByEmail(profile.email, siteId);

    if (existingByEmail) {
      if (!existingByEmail.isActive) {
        throw new AppError("Account inactive", 401);
      }

      await linkGoogleToExistingUser(existingByEmail, profile);
      await existingByEmail.save();

      return finishGoogleSignIn(existingByEmail);
    }

    try {
      user = new User({
        siteId,
        email: normalizeAuthEmail(profile.email),
        googleId: profile.googleId,
        authProvider: "google",
        firstName: profile.firstName,
        lastName: profile.lastName,
        role,
        isEmailVerified: true,
      });
      await user.save();
    } catch (err) {
      if (err.code !== 11000) {
        throw err;
      }

      const existingAfterConflict =
        (await findActiveUserByGoogleId(profile.googleId, siteId)) ||
        (await findActiveUserByEmail(profile.email, siteId));

      if (existingAfterConflict) {
        if (!existingAfterConflict.isActive) {
          throw new AppError("Account inactive", 401);
        }

        if (existingAfterConflict.googleId === profile.googleId) {
          const emailVerified = verifyEmailFromGoogle(existingAfterConflict);
          const avatarSynced = await syncGoogleAvatarIfMissing(
            existingAfterConflict,
            profile.picture,
          );
          if (emailVerified || avatarSynced) {
            await existingAfterConflict.save();
          }
          return finishGoogleSignIn(existingAfterConflict);
        }

        await linkGoogleToExistingUser(existingAfterConflict, profile);
        await existingAfterConflict.save();
        return finishGoogleSignIn(existingAfterConflict);
      }

      throw duplicateKeyAppError(err);
    }

    if (await syncGoogleAvatarIfMissing(user, profile.picture)) {
      await user.save();
    }

    if (role === ROLES.AGENT) {
      await AgentProfile.create({ userId: user._id });
    }

    notificationService
      .notifyFromEvent("auth.welcome", {
        userId: user._id,
        context: { name: user.firstName || user.email },
      })
      .catch((err) =>
        console.error("Registration notification failed:", err.message),
      );

    return finishGoogleSignIn(user);
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

    notificationService
      .notifyFromEvent("auth.email_verified", {
        userId: user._id,
        context: { name: user.firstName || user.email },
      })
      .catch((err) =>
        console.error("Email verified notification failed:", err.message),
      );

    return {
      message: "Email verified successfully",
      user: user.toPublicJSON(),
    };
  },

  async resendVerification(email) {
    const siteId = getRequestSiteId();
    const user = await User.findOne({
      email,
      siteId,
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
    const siteId = getRequestSiteId();
    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({
      tokenHash,
      siteId,
      revokedAt: null,
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findOne({
      _id: stored.userId,
      siteId,
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
      siteId,
      tokenHash: newTokenHash,
      expiresAt: getRefreshTokenExpiry(),
    });

    stored.replacedByToken = newTokenHash;
    await stored.save();

    const accessToken = generateAccessToken(user._id, user.role, siteId);

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
    const siteId = getRequestSiteId();
    const user = await User.findOne({ email, siteId, deletedAt: null });

    if (!user) {
      return { message: "If the email exists, a reset link has been sent" };
    }

    const { token, hashed, expires } = generatePasswordResetToken();

    user.passwordResetToken = hashed;
    user.passwordResetExpires = expires;
    await user.save();

    const resetUrl = buildSiteLink(`/reset-password?token=${token}`);

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

    notificationService
      .notifyFromEvent("auth.password_changed", {
        userId: user._id,
        context: { name: user.firstName || user.email },
      })
      .catch((err) =>
        console.error("Password changed notification failed:", err.message),
      );

    return { message: "Password changed successfully" };
  },
};
