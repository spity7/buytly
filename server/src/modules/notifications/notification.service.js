import { Notification } from "./notification.model.js";
import { User } from "../users/user.model.js";
import { emailService } from "../../services/email.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";

const isDeliverableUser = (user) =>
  user && user.deletedAt == null && user.isActive;

export const notificationService = {
  async notify({
    userId,
    type,
    title,
    message,
    data = {},
    sendEmail = false,
    emailTemplate = "generic",
    emailData = {},
  }) {
    const user = await User.findById(userId);
    if (!isDeliverableUser(user)) {
      return null;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      channels: { inApp: true, email: sendEmail },
    });

    if (sendEmail && user.email) {
      emailService
        .send(user.email, emailTemplate, {
          title,
          message,
          name: user.firstName || user.email,
          ...emailData,
        })
        .catch((err) => console.error("Email send failed:", err.message));
    }

    return notification;
  },

  async getNotifications(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId };

    if (query.unread === "true") {
      filter.isRead = false;
    } else if (query.unread === "false") {
      filter.isRead = true;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.isRead) {
      return notification;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  },

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  },

  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  },
};
