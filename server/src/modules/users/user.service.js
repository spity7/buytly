import { User } from "./user.model.js";
import { RefreshToken } from "../auth/refreshToken.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { AppError } from "../../shared/AppError.js";
import { applyPhoneFields } from "../../shared/phone.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const userService = {
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const profile = user.toPublicJSON();
    if (profile.avatar?.gcsKey) {
      profile.avatar = await gcsService.resolveAvatar(profile.avatar);
    }

    return profile;
  },

  async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    applyPhoneFields(user, data);

    await user.save({ runValidators: true });
    return user.toPublicJSON();
  },

  async updateSocialLinks(userId, socialLinks) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.socialLinks = {
      ...(user.socialLinks?.toObject?.() || user.socialLinks || {}),
      ...socialLinks,
    };
    await user.save();

    return user.toPublicJSON();
  },

  async updatePreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.preferences = {
      ...(user.preferences?.toObject?.() || user.preferences || {}),
      ...preferences,
    };
    await user.save();

    return user.toPublicJSON();
  },

  async addSavedSearch(userId, { name, filters }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.savedSearches.push({ name, filters });
    await user.save();

    return user.savedSearches;
  },

  async getSavedSearches(userId) {
    const user = await User.findById(userId).select("savedSearches");
    if (!user) throw new AppError("User not found", 404);
    return user.savedSearches;
  },

  async removeSavedSearch(userId, searchId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const search = user.savedSearches.id(searchId);
    if (!search) throw new AppError("Saved search not found", 404);

    search.deleteOne();
    await user.save();

    return user.savedSearches;
  },

  async uploadAvatar(userId, file) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.avatar?.gcsKey) {
      await gcsService.deleteFile(user.avatar.gcsKey);
    }

    const uploaded = await gcsService.uploadFile(file.buffer, {
      folder: "avatars",
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    user.avatar = uploaded;
    await user.save();

    const url = await gcsService.getSignedUrl(uploaded.gcsKey);
    return { avatar: { ...uploaded, url } };
  },

  async deleteAvatar(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.avatar?.gcsKey) {
      await gcsService.deleteFile(user.avatar.gcsKey);
    }

    await User.findByIdAndUpdate(userId, { $unset: { avatar: 1 } });

    return { avatar: null };
  },

  async getPublicProfile(userId) {
    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
      isActive: true,
    }).select("firstName lastName role avatar createdAt");

    if (!user) throw new AppError("User not found", 404);

    const profile = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };

    if (user.avatar?.gcsKey) {
      const resolved = await gcsService.resolveAvatar(user.avatar);
      profile.avatar = { url: resolved.url };
    }

    return profile;
  },

  async deleteAccount(userId, password) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user || user.deletedAt) {
      throw new AppError("User not found", 404);
    }

    if (user.authProvider !== "google") {
      if (!password) {
        throw new AppError("Invalid password", 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError("Invalid password", 401);
      }
    }

    if (user.avatar?.gcsKey) {
      await gcsService.deleteFile(user.avatar.gcsKey).catch(() => {});
    }

    user.deletedAt = new Date();
    user.isActive = false;
    user.email = `deleted_${user._id}@deleted.buytly.internal`;
    user.passwordHash = await bcrypt.hash(
      crypto.randomBytes(32).toString("hex"),
      12,
    );
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id },
      { revokedAt: new Date() },
    );

    return { message: "Account deleted successfully" };
  },
};
