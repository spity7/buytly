import { notificationService } from "./notification.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const notificationController = {
  list: async (req, res) => {
    const result = await notificationService.getNotifications(
      req.user._id,
      req.query,
    );
    ApiResponse.paginated(res, result.notifications, result.pagination);
  },

  markRead: async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.user._id,
      req.params.id,
    );
    ApiResponse.success(res, notification, "Notification marked as read");
  },

  markAllRead: async (req, res) => {
    await notificationService.markAllAsRead(req.user._id);
    ApiResponse.success(res, null, "All notifications marked as read");
  },

  remove: async (req, res) => {
    await notificationService.deleteNotification(req.user._id, req.params.id);
    ApiResponse.success(res, null, "Notification deleted");
  },

  unreadCount: async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user._id);
    ApiResponse.success(res, { count });
  },
};
