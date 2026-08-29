import { Booking } from "./booking.model.js";
import { Property } from "../properties/property.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { ROLES } from "../../shared/constants.js";

export const bookingService = {
  async create(buyerId, data) {
    const property = await Property.findOne({
      _id: data.propertyId,
      deletedAt: null,
      status: "active",
    });
    if (!property)
      throw new AppError("Property not available for booking", 404);

    const agentId = property.agentId || property.ownerId;

    const booking = await Booking.create({
      propertyId: data.propertyId,
      buyerId,
      agentId,
      scheduledAt: data.scheduledAt,
      message: data.message,
    });

    const populated = await booking.populate([
      { path: "propertyId", select: "title slug" },
      { path: "buyerId", select: "firstName lastName email" },
      { path: "agentId", select: "firstName lastName email" },
    ]);

    notificationService
      .notifyFromEvent("booking.created", {
        userId: agentId,
        context: {
          bookingId: booking._id,
          propertyId: property._id,
          propertyTitle: property.title,
        },
      })
      .catch((err) =>
        console.error("Booking notification failed:", err.message),
      );

    return populated;
  },

  async getMyBookings(buyerId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { buyerId };
    if (query.status) filter.status = query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("propertyId", "title slug price location status media")
        .populate("agentId", "firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return { bookings, pagination: buildPaginationMeta(total, page, limit) };
  },

  async getAgentBookings(agentId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { agentId };
    if (query.status) filter.status = query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("propertyId", "title slug price location")
        .populate("buyerId", "firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return { bookings, pagination: buildPaginationMeta(total, page, limit) };
  },

  async updateStatus(bookingId, data, user) {
    const booking = await Booking.findById(bookingId).populate([
      { path: "propertyId", select: "title" },
      { path: "buyerId", select: "firstName lastName email" },
    ]);
    if (!booking) throw new AppError("Booking not found", 404);

    const canUpdate =
      user.role === ROLES.ADMIN || booking.agentId.equals(user._id);

    if (!canUpdate) throw new AppError("Not authorized", 403);

    if (["cancelled", "completed"].includes(booking.status)) {
      throw new AppError("Booking cannot be updated", 400);
    }

    booking.status = data.status;
    if (data.agentNotes) booking.agentNotes = data.agentNotes;
    await booking.save();

    notificationService
      .notifyFromEvent("booking.status_updated", {
        userId: booking.buyerId._id,
        context: {
          bookingId: booking._id,
          propertyTitle: booking.propertyId.title,
          status: data.status,
          name: booking.buyerId.firstName || booking.buyerId.email,
        },
      })
      .catch((err) =>
        console.error("Booking notification failed:", err.message),
      );

    return booking;
  },

  async cancel(bookingId, buyerId) {
    const booking = await Booking.findOne({ _id: bookingId, buyerId }).populate(
      "propertyId",
      "title",
    );
    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.status !== "pending") {
      throw new AppError("Only pending bookings can be cancelled", 400);
    }

    booking.status = "cancelled";
    await booking.save();

    notificationService
      .notifyFromEvent("booking.cancelled", {
        userId: booking.agentId,
        context: {
          bookingId: booking._id,
          propertyTitle: booking.propertyId?.title,
        },
      })
      .catch((err) =>
        console.error("Booking notification failed:", err.message),
      );

    return booking;
  },
};
