import { bookingService } from "./booking.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const bookingController = {
  create: async (req, res) => {
    const booking = await bookingService.create(req.user._id, req.body);
    ApiResponse.created(res, booking, "Booking request submitted");
  },

  getMy: async (req, res) => {
    const result = await bookingService.getMyBookings(req.user._id, req.query);
    ApiResponse.paginated(res, result.bookings, result.pagination);
  },

  getAgent: async (req, res) => {
    const result = await bookingService.getAgentBookings(
      req.user._id,
      req.query,
    );
    ApiResponse.paginated(res, result.bookings, result.pagination);
  },

  updateStatus: async (req, res) => {
    const booking = await bookingService.updateStatus(
      req.params.id,
      req.body,
      req.user,
    );
    ApiResponse.success(res, booking, "Booking status updated");
  },

  cancel: async (req, res) => {
    const booking = await bookingService.cancel(req.params.id, req.user._id);
    ApiResponse.success(res, booking, "Booking cancelled");
  },
};
