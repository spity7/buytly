import { User } from "./user.model.js";
import { gcsService } from "../../services/gcs.service.js";
import { AppError } from "../../shared/AppError.js";

export const userService = {
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const profile = user.toPublicJSON();
    if (profile.avatar?.gcsKey) {
      profile.avatar.url = await gcsService.getSignedUrl(profile.avatar.gcsKey);
    }

    return profile;
  },

  async updateProfile(userId, data) {
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new AppError("User not found", 404);
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
      profile.avatar = {
        url: await gcsService.getSignedUrl(user.avatar.gcsKey),
      };
    }

    return profile;
  },
};
