import { Booking } from "./booking.model.js";
import { Property } from "../properties/property.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { NOTIFICATION_TYPES, ROLES } from "../../shared/constants.js";

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
      .notify({
        userId: agentId,
        type: NOTIFICATION_TYPES.BOOKING,
        title: "New Visit Request",
        message: `A buyer requested a visit for "${property.title}"`,
        data: { bookingId: booking._id, propertyId: property._id },
        sendEmail: true,
        emailTemplate: "generic",
        emailData: {
          title: "New Visit Request",
          message: `Visit requested for ${property.title}`,
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
    const booking = await Booking.findById(bookingId).populate(
      "propertyId",
      "title",
    );
    if (!booking) throw new AppError("Booking not found", 404);

    const canUpdate =
      user.role === ROLES.ADMIN ||
      (user.role === ROLES.AGENT && booking.agentId.equals(user._id));

    if (!canUpdate) throw new AppError("Not authorized", 403);

    if (["cancelled", "completed"].includes(booking.status)) {
      throw new AppError("Booking cannot be updated", 400);
    }

    booking.status = data.status;
    if (data.agentNotes) booking.agentNotes = data.agentNotes;
    await booking.save();

    notificationService
      .notify({
        userId: booking.buyerId,
        type: NOTIFICATION_TYPES.BOOKING,
        title: `Booking ${data.status}`,
        message: `Your visit request for "${booking.propertyId.title}" has been ${data.status}`,
        data: { bookingId: booking._id },
        sendEmail: true,
        emailTemplate: "bookingStatus",
        emailData: {
          status: data.status,
          propertyTitle: booking.propertyId.title,
        },
      })
      .catch((err) =>
        console.error("Booking notification failed:", err.message),
      );

    return booking;
  },

  async cancel(bookingId, buyerId) {
    const booking = await Booking.findOne({ _id: bookingId, buyerId });
    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.status !== "pending") {
      throw new AppError("Only pending bookings can be cancelled", 400);
    }

    booking.status = "cancelled";
    await booking.save();

    notificationService
      .notify({
        userId: booking.agentId,
        type: NOTIFICATION_TYPES.BOOKING,
        title: "Booking Cancelled",
        message: "A buyer cancelled their visit request",
        data: { bookingId: booking._id },
      })
      .catch((err) =>
        console.error("Booking notification failed:", err.message),
      );

    return booking;
  },
};
