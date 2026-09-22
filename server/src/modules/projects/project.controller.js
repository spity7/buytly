import multer from "multer";
import { projectService } from "./project.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import { createMulterOptions } from "../../services/gcs.service.js";

const upload = multer(createMulterOptions(multer));

export const projectController = {
  create: async (req, res) => {
    const project = await projectService.create(req.body, req.user);
    ApiResponse.created(res, project, "Project created");
  },

  list: async (req, res) => {
    const result = await projectService.list(req.query);
    ApiResponse.paginated(res, result.projects, result.pagination);
  },

  listMine: async (req, res) => {
    const result = await projectService.listMine(req.user, req.query);
    ApiResponse.paginated(res, result.projects, result.pagination);
  },

  getById: async (req, res) => {
    const project = await projectService.getById(req.params.id, {
      user: req.user,
      includeUnits: req.query.includeUnits === "true",
    });
    ApiResponse.success(res, project);
  },

  getBySlug: async (req, res) => {
    const project = await projectService.getBySlug(req.params.slug, {
      user: req.user,
      includeUnits: true,
    });
    ApiResponse.success(res, project);
  },

  listUnits: async (req, res) => {
    const units = await projectService.listUnits(req.params.id, req.user);
    ApiResponse.success(res, units);
  },

  update: async (req, res) => {
    const project = await projectService.update(
      req.params.id,
      req.body,
      req.user,
    );
    ApiResponse.success(res, project, "Project updated");
  },

  remove: async (req, res) => {
    await projectService.softDelete(req.params.id, req.user);
    ApiResponse.success(res, null, "Project deleted");
  },

  restore: async (req, res) => {
    const project = await projectService.restore(req.params.id, req.user);
    ApiResponse.success(res, project, "Project restored");
  },

  uploadMedia: [
    upload.single("media"),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
        }
        const media = await projectService.uploadMedia(
          req.params.id,
          req.file,
          req.user,
        );
        ApiResponse.created(res, media, "Media uploaded");
      } catch (error) {
        next(error);
      }
    },
  ],

  removeMedia: async (req, res) => {
    await projectService.removeMedia(
      req.params.id,
      req.params.mediaId,
      req.user,
    );
    ApiResponse.success(res, null, "Media removed");
  },

  reorderMedia: async (req, res) => {
    const project = await projectService.reorderMedia(
      req.params.id,
      req.body,
      req.user,
    );
    ApiResponse.success(res, project, "Photo order updated");
  },
};
