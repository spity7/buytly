import multer from "multer";
import { userService } from "./user.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import { avatarUpload } from "../../services/gcs.service.js";

const upload = avatarUpload(multer);

export const userController = {
  getMe: async (req, res) => {
    const profile = await userService.getMe(req.user._id);
    ApiResponse.success(res, profile);
  },

  updateProfile: async (req, res) => {
    const profile = await userService.updateProfile(req.user._id, req.body);
    ApiResponse.success(res, profile, "Profile updated");
  },

  updatePreferences: async (req, res) => {
    const profile = await userService.updatePreferences(req.user._id, req.body);
    ApiResponse.success(res, profile, "Preferences updated");
  },

  addSavedSearch: async (req, res) => {
    const searches = await userService.addSavedSearch(req.user._id, req.body);
    ApiResponse.created(res, searches, "Search saved");
  },

  getSavedSearches: async (req, res) => {
    const searches = await userService.getSavedSearches(req.user._id);
    ApiResponse.success(res, searches);
  },

  removeSavedSearch: async (req, res) => {
    const searches = await userService.removeSavedSearch(
      req.user._id,
      req.params.id,
    );
    ApiResponse.success(res, searches, "Search removed");
  },

  uploadAvatar: [
    upload.single("avatar"),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
        }
        const result = await userService.uploadAvatar(req.user._id, req.file);
        ApiResponse.success(res, result, "Avatar uploaded");
      } catch (error) {
        next(error);
      }
    },
  ],

  getPublicProfile: async (req, res) => {
    const profile = await userService.getPublicProfile(req.params.id);
    ApiResponse.success(res, profile);
  },

  deleteAccount: async (req, res) => {
    const result = await userService.deleteAccount(
      req.user._id,
      req.body.password,
    );
    ApiResponse.success(res, result, "Account deleted successfully");
  },
};
