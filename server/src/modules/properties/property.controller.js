import multer from "multer";
import { propertyService } from "./property.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";
import { createMulterOptions } from "../../services/gcs.service.js";

const upload = multer(createMulterOptions(multer));

export const propertyController = {
  create: async (req, res) => {
    const property = await propertyService.create(req.body, req.user);
    ApiResponse.created(res, property, "Property created");
  },

  list: async (req, res) => {
    const result = await propertyService.list(req.query);
    ApiResponse.paginated(res, result.properties, result.pagination);
  },

  listMine: async (req, res) => {
    const result = await propertyService.listMine(req.user, req.query);
    ApiResponse.paginated(res, result.properties, result.pagination);
  },

  getById: async (req, res) => {
    const property = await propertyService.getById(req.params.id, {
      user: req.user,
    });
    ApiResponse.success(res, property);
  },

  update: async (req, res) => {
    const property = await propertyService.update(
      req.params.id,
      req.body,
      req.user,
    );
    ApiResponse.success(res, property, "Property updated");
  },

  remove: async (req, res) => {
    await propertyService.softDelete(req.params.id, req.user);
    ApiResponse.success(res, null, "Property deleted");
  },

  restore: async (req, res) => {
    const property = await propertyService.restore(req.params.id, req.user);
    ApiResponse.success(res, property, "Property restored");
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
        const media = await propertyService.uploadMedia(
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
    await propertyService.removeMedia(
      req.params.id,
      req.params.mediaId,
      req.user,
    );
    ApiResponse.success(res, null, "Media removed");
  },

  uploadFloorPlanImage: [
    upload.single("image"),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
        }
        const result = await propertyService.uploadFloorPlanImage(
          req.params.id,
          req.file,
          req.user,
        );
        ApiResponse.created(res, result, "Floor plan image uploaded");
      } catch (error) {
        next(error);
      }
    },
  ],
};
