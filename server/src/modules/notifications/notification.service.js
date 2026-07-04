import { Notification } from "./notification.model.js";
import { User } from "../users/user.model.js";
import { emailService } from "../../services/email.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";

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
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      channels: { inApp: true, email: sendEmail },
    });

    if (sendEmail) {
      const user = await User.findById(userId);
      if (user?.email) {
        emailService
          .send(user.email, emailTemplate, {
            title,
            message,
            name: user.firstName || user.email,
            ...emailData,
          })
          .catch((err) => console.error("Email send failed:", err.message));
      }
    }

    return notification;
  },

  async getNotifications(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId };

    if (query.unread === "true") filter.isRead = false;

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
