import { User } from "../users/user.model.js";
import { Property } from "../properties/property.model.js";
import { Booking } from "../bookings/booking.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { cacheService } from "../../services/cache.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";

export const adminService = {
  async listUsers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { deletedAt: null };

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined)
      filter.isActive = query.isActive === "true";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map((u) => u.toPublicJSON()),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async updateUserStatus(userId, isActive) {
    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { isActive },
      { new: true },
    );

    if (!user) throw new AppError("User not found", 404);
    return user.toPublicJSON();
  },

  async updateUserRole(userId, role) {
    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { role },
      { new: true },
    );

    if (!user) throw new AppError("User not found", 404);
    return user.toPublicJSON();
  },

  async listProperties(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { deletedAt: null };
    if (query.status) filter.status = query.status;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("ownerId", "firstName lastName email")
        .populate("agentId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    return { properties, pagination: buildPaginationMeta(total, page, limit) };
  },

  async moderateProperty(propertyId, status) {
    const property = await Property.findOneAndUpdate(
      { _id: propertyId, deletedAt: null },
      { status },
      { new: true },
    );

    if (!property) throw new AppError("Property not found", 404);
    await cacheService.invalidateProperties();
    return property;
  },

  async getAnalytics() {
    const cacheKey = "admin:analytics";
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      usersByRole,
      listingsByType,
      bookingsThisMonth,
      transactionVolume,
      topCities,
    ] = await Promise.all([
      User.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: { type: "$type", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $count: "count" },
      ]),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Property.aggregate([
        { $match: { deletedAt: null, status: "active" } },
        { $group: { _id: "$location.city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const analytics = {
      usersByRole,
      listingsByType,
      bookingsThisMonth: bookingsThisMonth[0]?.count || 0,
      transactionVolume,
      topCities,
    };

    await cacheService.set(cacheKey, analytics, 600);
    return analytics;
  },
};
