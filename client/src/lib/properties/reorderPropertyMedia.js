import { customInstance } from "@/lib/api/custom-instance";

export async function reorderPropertyImages(propertyId, imageIds) {
  const response = await customInstance({
    url: `/properties/${propertyId}/media/order`,
    method: "PUT",
    data: { imageIds },
  });
  return response.data;
}
