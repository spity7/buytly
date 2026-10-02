import { adminService } from "./admin.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const adminController = {
  listPartnerSites: async (req, res) => {
    const sites = await adminService.listPartnerSites(req.user);
    ApiResponse.success(res, sites);
  },

  listUsers: async (req, res) => {
    const result = await adminService.listUsers(req.query, req.user);
    ApiResponse.paginated(res, result.users, result.pagination);
  },

  getUserById: async (req, res) => {
    const result = await adminService.getUserById(req.params.id, req.user);
    ApiResponse.success(res, result);
  },

  updateUserStatus: async (req, res) => {
    const user = await adminService.updateUserStatus(
      req.params.id,
      req.body.isActive,
      req.user,
    );
    ApiResponse.success(res, user, "User status updated");
  },

  updateUserRole: async (req, res) => {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user,
    );
    ApiResponse.success(res, user, "User role updated");
  },

  listProperties: async (req, res) => {
    const result = await adminService.listProperties(req.query, req.user);
    ApiResponse.paginated(res, result.properties, result.pagination);
  },

  moderateProperty: async (req, res) => {
    const property = await adminService.moderateProperty(
      req.params.id,
      req.body.status,
      req.user,
    );
    ApiResponse.success(res, property, "Property moderated");
  },

  setPropertyPlatformFeatured: async (req, res) => {
    const property = await adminService.setPropertyPlatformFeatured(
      req.params.id,
      req.body.visibleOnPlatform,
      req.user,
    );
    ApiResponse.success(res, property, "Marketplace featuring updated");
  },

  listProjects: async (req, res) => {
    const result = await adminService.listProjects(req.query, req.user);
    ApiResponse.paginated(res, result.projects, result.pagination);
  },

  moderateProject: async (req, res) => {
    const project = await adminService.moderateProject(
      req.params.id,
      req.body.status,
      req.user,
    );
    ApiResponse.success(res, project, "Project moderated");
  },

  setProjectPlatformFeatured: async (req, res) => {
    const project = await adminService.setProjectPlatformFeatured(
      req.params.id,
      req.body.visibleOnPlatform,
      req.user,
    );
    ApiResponse.success(res, project, "Marketplace featuring updated");
  },

  getAnalytics: async (req, res) => {
    const analytics = await adminService.getAnalytics(req.query, req.user);
    ApiResponse.success(res, analytics);
  },
};
