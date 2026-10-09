import { catalogService } from "./catalog.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const catalogController = {
  listPropertyTypes: async (req, res) => {
    const items = await catalogService.listPropertyTypes({ activeOnly: true });
    ApiResponse.success(res, items);
  },

  listAmenities: async (req, res) => {
    const items = await catalogService.listAmenities({ activeOnly: true });
    ApiResponse.success(res, items);
  },

  getNearbyPreview: async (req, res) => {
    const { lat, lng } = req.query;
    const nearby = await catalogService.getNearbyPreview(lat, lng);
    ApiResponse.success(res, nearby);
  },

  adminListPropertyTypes: async (req, res) => {
    const items = await catalogService.listPropertyTypesForAdmin();
    ApiResponse.success(res, items);
  },

  adminCreatePropertyType: async (req, res) => {
    const item = await catalogService.createPropertyType(req.body);
    ApiResponse.created(res, item, "Property type created");
  },

  adminUpdatePropertyType: async (req, res) => {
    const item = await catalogService.updatePropertyType(
      req.params.id,
      req.body,
    );
    ApiResponse.success(res, item, "Property type updated");
  },

  adminDeletePropertyType: async (req, res) => {
    await catalogService.deletePropertyType(req.params.id);
    ApiResponse.success(res, null, "Property type deleted");
  },

  adminListAmenities: async (req, res) => {
    const items = await catalogService.listAmenitiesForAdmin();
    ApiResponse.success(res, items);
  },

  adminCreateAmenity: async (req, res) => {
    const item = await catalogService.createAmenity(req.body);
    ApiResponse.created(res, item, "Amenity created");
  },

  adminUpdateAmenity: async (req, res) => {
    const item = await catalogService.updateAmenity(req.params.id, req.body);
    ApiResponse.success(res, item, "Amenity updated");
  },

  adminDeleteAmenity: async (req, res) => {
    await catalogService.deleteAmenity(req.params.id);
    ApiResponse.success(res, null, "Amenity deleted");
  },
};
