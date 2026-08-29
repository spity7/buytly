import { Transaction } from "./transaction.model.js";
import { Property } from "../properties/property.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { cacheService } from "../../services/cache.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { ROLES } from "../../shared/constants.js";

export const transactionService = {
  async create(buyerId, data) {
    const property = await Property.findOne({
      _id: data.propertyId,
      deletedAt: null,
      status: "active",
    });
    if (!property) throw new AppError("Property not available", 404);

    const transaction = await Transaction.create({
      propertyId: data.propertyId,
      buyerId,
      sellerId: property.ownerId,
      agentId: property.agentId,
      type: data.type,
      amount: data.amount,
      currency: data.currency || property.currency,
      notes: data.notes,
    });

    const populated = await transaction.populate([
      { path: "propertyId", select: "title slug price" },
      { path: "buyerId", select: "firstName lastName email" },
      { path: "sellerId", select: "firstName lastName email" },
      { path: "agentId", select: "firstName lastName email" },
    ]);

    const notifyIds = [
      ...new Set(
        [property.ownerId, property.agentId]
          .filter(Boolean)
          .map((id) => id.toString()),
      ),
    ];

    await notificationService.notifyMany(
      "transaction.created",
      notifyIds,
      {
        transactionId: transaction._id,
        propertyTitle: property.title,
        transactionType: data.type,
      },
    );

    return populated;
  },

  async getMyTransactions(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      $or: [{ buyerId: userId }, { sellerId: userId }, { agentId: userId }],
    };
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("propertyId", "title slug price location")
        .populate("buyerId", "firstName lastName email")
        .populate("sellerId", "firstName lastName email")
        .populate("agentId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id, userId) {
    const transaction = await Transaction.findById(id)
      .populate("propertyId", "title slug price location media")
      .populate("buyerId", "firstName lastName email phone")
      .populate("sellerId", "firstName lastName email phone")
      .populate("agentId", "firstName lastName email phone");

    if (!transaction) throw new AppError("Transaction not found", 404);

    const isParty =
      transaction.buyerId._id.equals(userId) ||
      transaction.sellerId._id.equals(userId) ||
      (transaction.agentId && transaction.agentId._id.equals(userId));

    if (!isParty) throw new AppError("Not authorized", 403);

    return transaction;
  },

  async updateStatus(id, data, user) {
    const transaction = await Transaction.findById(id).populate([
      { path: "propertyId", select: "title" },
      { path: "buyerId", select: "firstName lastName email" },
      { path: "sellerId", select: "firstName lastName email" },
      { path: "agentId", select: "firstName lastName email" },
    ]);
    if (!transaction) throw new AppError("Transaction not found", 404);

    const canUpdate =
      user.role === ROLES.ADMIN ||
      transaction.sellerId._id.equals(user._id) ||
      (transaction.agentId && transaction.agentId._id.equals(user._id));

    if (!canUpdate) throw new AppError("Not authorized", 403);

    if (["completed", "cancelled"].includes(transaction.status)) {
      throw new AppError("Transaction cannot be updated", 400);
    }

    transaction.status = data.status;
    if (data.notes) transaction.notes = data.notes;
    if (data.status === "completed") transaction.completedAt = new Date();
    await transaction.save();

    if (data.status === "completed") {
      await Property.findByIdAndUpdate(transaction.propertyId._id, {
        status: transaction.type === "rent" ? "rented" : "sold",
      });
      await cacheService.invalidateProperties();
    }

    const recipientIds = [
      transaction.buyerId._id,
      transaction.sellerId._id,
      transaction.agentId?._id,
    ].filter(Boolean);

    const context = {
      transactionId: transaction._id,
      propertyTitle: transaction.propertyId.title,
      status: data.status,
    };

    await Promise.all(
      recipientIds.map((userId) => {
        const recipient =
          userId.equals(transaction.buyerId._id)
            ? transaction.buyerId
            : userId.equals(transaction.sellerId._id)
              ? transaction.sellerId
              : transaction.agentId;

        return notificationService
          .notifyFromEvent("transaction.status_updated", {
            userId,
            context: {
              ...context,
              name: recipient?.firstName || recipient?.email,
            },
          })
          .catch((err) =>
            console.error("Transaction notification failed:", err.message),
          );
      }),
    );

    return transaction;
  },
};
