import { Transaction } from "./transaction.model.js";
import { Property } from "../properties/property.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { NOTIFICATION_TYPES, ROLES } from "../../shared/constants.js";

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

    await Promise.all(
      notifyIds.map((userId) =>
        notificationService
          .notify({
            userId,
            type: NOTIFICATION_TYPES.TRANSACTION,
            title: "New Transaction Request",
            message: `A ${data.type} transaction was initiated for "${property.title}"`,
            data: { transactionId: transaction._id },
            sendEmail: true,
            emailTemplate: "generic",
            emailData: {
              title: "New Transaction",
              message: `Transaction initiated for ${property.title}`,
            },
          })
          .catch((err) =>
            console.error("Transaction notification failed:", err.message),
          ),
      ),
    );

    return populated;
  },

  async getMyTransactions(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      $or: [{ buyerId: userId }, { sellerId: userId }, { agentId: userId }],
    };
    if (query.status) filter.status = query.status;

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
    const transaction = await Transaction.findById(id).populate(
      "propertyId",
      "title",
    );
    if (!transaction) throw new AppError("Transaction not found", 404);

    const canUpdate =
      user.role === ROLES.ADMIN ||
      transaction.sellerId.equals(user._id) ||
      (transaction.agentId && transaction.agentId.equals(user._id));

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
    }

    notificationService
      .notify({
        userId: transaction.buyerId,
        type: NOTIFICATION_TYPES.TRANSACTION,
        title: `Transaction ${data.status}`,
        message: `Your transaction for "${transaction.propertyId.title}" is now ${data.status}`,
        data: { transactionId: transaction._id },
        sendEmail: true,
        emailTemplate: "transactionUpdate",
        emailData: {
          status: data.status,
          propertyTitle: transaction.propertyId.title,
        },
      })
      .catch((err) =>
        console.error("Transaction notification failed:", err.message),
      );

    return transaction;
  },
};
