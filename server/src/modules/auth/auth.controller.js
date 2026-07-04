import { authService } from "./auth.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const authController = {
  register: async (req, res) => {
    const result = await authService.register(req.body);
    ApiResponse.created(res, result, "Registration successful");
  },

  login: async (req, res) => {
    const result = await authService.login(req.body);
    ApiResponse.success(res, result, "Login successful");
  },

  refresh: async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken);
    ApiResponse.success(res, result, "Token refreshed");
  },

  logout: async (req, res) => {
    await authService.logout(req.body.refreshToken);
    ApiResponse.success(res, null, "Logged out successfully");
  },

  forgotPassword: async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    ApiResponse.success(res, result);
  },

  resetPassword: async (req, res) => {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.password,
    );
    ApiResponse.success(res, result);
  },
};
