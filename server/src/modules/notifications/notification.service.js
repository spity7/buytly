import { Notification } from "./notification.model.js";
import { User } from "../users/user.model.js";
import { emailService } from "../../services/email.service.js";
import { AppError } from "../../shared/AppError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import {
  buildNotificationPayload,
  buildHref as buildEventHref,
} from "./notification.catalog.js";
import { shouldDeliverNotification } from "./notification.preferences.js";

const isDeliverableUser = (user) =>
  user && user.deletedAt == null && user.isActive;

export const notificationService = {
  shouldDeliver(user, preferenceKey, channel) {
    return shouldDeliverNotification(user, preferenceKey, channel);
  },

  buildHref(eventKey, context = {}) {
    return buildEventHref(eventKey, context);
  },

  async notify({
    userId,
    type,
    title,
    message,
    data = {},
    sendEmail = false,
    emailTemplate = "generic",
    emailData = {},
    preferenceKey,
  }) {
    const user = await User.findById(userId);
    if (!isDeliverableUser(user)) {
      return null;
    }

    const prefKey = preferenceKey || type;
    const deliverInApp = this.shouldDeliver(user, prefKey, "inApp");
    const deliverEmail =
      sendEmail && this.shouldDeliver(user, prefKey, "email");

    if (!deliverInApp && !deliverEmail) {
      return null;
    }

    let notification = null;

    if (deliverInApp) {
      notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        channels: { inApp: true, email: deliverEmail },
      });
    }

    if (deliverEmail && user.email) {
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

  async notifyFromEvent(eventKey, { userId, context = {} }) {
    const payload = buildNotificationPayload(eventKey, context);
    return this.notify({
      userId,
      ...payload,
    });
  },

  async notifyMany(eventKey, userIds, context = {}) {
    const uniqueIds = [...new Set(userIds.filter(Boolean).map(String))];
    return Promise.all(
      uniqueIds.map((userId) =>
        this.notifyFromEvent(eventKey, { userId, context }).catch((err) => {
          console.error(
            `Notification ${eventKey} failed for ${userId}:`,
            err.message,
          );
          return null;
        }),
      ),
    );
  },

  async getNotifications(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId };

    if (query.unread === "true") {
      filter.isRead = false;
    } else if (query.unread === "false") {
      filter.isRead = true;
    }

    if (query.type) {
      filter.type = query.type;
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

  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return notification;
  },

  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  },
};
