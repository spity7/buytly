import { ApiResponse } from "../../shared/ApiResponse.js";
import { submitContactInquiry } from "./contact.service.js";

export const contactController = {
  async submit(req, res) {
    await submitContactInquiry(req.body);
    return ApiResponse.created(res, null, "Your message has been sent.");
  },
};
