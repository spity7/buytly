import { adminService } from "./admin.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const adminController = {
  listUsers: async (req, res) => {
    const result = await adminService.listUsers(req.query);
    ApiResponse.paginated(res, result.users, result.pagination);
  },

  updateUserStatus: async (req, res) => {
    const user = await adminService.updateUserStatus(
      req.params.id,
      req.body.isActive,
    );
    ApiResponse.success(res, user, "User status updated");
  },

  updateUserRole: async (req, res) => {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
    );
    ApiResponse.success(res, user, "User role updated");
  },

  listProperties: async (req, res) => {
    const result = await adminService.listProperties(req.query);
    ApiResponse.paginated(res, result.properties, result.pagination);
  },

  moderateProperty: async (req, res) => {
    const property = await adminService.moderateProperty(
      req.params.id,
      req.body.status,
    );
    ApiResponse.success(res, property, "Property moderated");
  },

  getAnalytics: async (req, res) => {
    const analytics = await adminService.getAnalytics();
    ApiResponse.success(res, analytics);
  },
};
