import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { notificationService } from "../src/modules/notifications/notification.service.js";
import { Notification } from "../src/modules/notifications/notification.model.js";
import { NOTIFICATION_TYPES } from "../src/shared/constants.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerUser = async (app, email) => {
  const res = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
  });
  return {
    token: res.body.data.accessToken,
    userId: res.body.data.user.id,
  };
};

describe.skipIf(!mongoAvailable)("notifications API", () => {
  it("lists only unread notifications when unread=true", async () => {
    const app = await getApp();
    const { token, userId } = await registerUser(
      app,
      "unread-filter@example.com",
    );

    await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Unread",
      message: "Still unread",
    });

    const notifications = await Notification.find({ userId });
    const unread = notifications.find((n) => !n.isRead && n.title === "Unread");
    const read = notifications.find((n) => n.title !== "Unread");
    if (read) {
      read.isRead = true;
      read.readAt = new Date();
      await read.save();
    }

    const res = await request(app)
      .get("/api/v1/notifications?unread=true")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((n) => n.isRead === false)).toBe(true);
    expect(res.body.data.some((n) => n.title === "Unread")).toBe(true);
    expect(unread).toBeTruthy();
  });

  it("lists only read notifications when unread=false", async () => {
    const app = await getApp();
    const { token, userId } = await registerUser(
      app,
      "read-filter@example.com",
    );

    const created = await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Mark me read",
      message: "Test",
    });
    created.isRead = true;
    created.readAt = new Date();
    await created.save();

    const res = await request(app)
      .get("/api/v1/notifications?unread=false")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((n) => n.isRead === true)).toBe(true);
    expect(res.body.data.some((n) => n.title === "Mark me read")).toBe(true);
  });

  it("marks a notification as read and is idempotent", async () => {
    const app = await getApp();
    const { token, userId } = await registerUser(app, "mark-read@example.com");

    const notification = await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "To read",
      message: "Test",
    });

    const first = await request(app)
      .patch(`/api/v1/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(first.status).toBe(200);
    expect(first.body.data.isRead).toBe(true);
    expect(first.body.data.readAt).toBeTruthy();
    const firstReadAt = first.body.data.readAt;

    const second = await request(app)
      .patch(`/api/v1/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(200);
    expect(second.body.data.readAt).toBe(firstReadAt);
  });

  it("returns 404 when marking another user's notification", async () => {
    const app = await getApp();
    const userA = await registerUser(app, "notif-user-a@example.com");
    const userB = await registerUser(app, "notif-user-b@example.com");

    const notification = await notificationService.notify({
      userId: userA.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Private",
      message: "Test",
    });

    const res = await request(app)
      .patch(`/api/v1/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${userB.token}`);

    expect(res.status).toBe(404);
  });

  it("marks all notifications as read", async () => {
    const app = await getApp();
    const { token, userId } = await registerUser(app, "read-all@example.com");

    await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "One",
      message: "Test",
    });
    await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Two",
      message: "Test",
    });

    const res = await request(app)
      .patch("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const unread = await Notification.countDocuments({ userId, isRead: false });
    expect(unread).toBe(0);
  });

  it("returns accurate unread count", async () => {
    const app = await getApp();
    const { token, userId } = await registerUser(
      app,
      "unread-count@example.com",
    );

    const before = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${token}`);

    await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Extra",
      message: "Test",
    });

    const after = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${token}`);

    expect(after.status).toBe(200);
    expect(after.body.data.count).toBe(before.body.data.count + 1);
  });

  it("skips notify for deleted or inactive users", async () => {
    const app = await getApp();
    const { userId } = await registerUser(app, "deleted-notify@example.com");

    const user = await (
      await import("../src/modules/users/user.model.js")
    ).User.findById(userId);
    user.deletedAt = new Date();
    user.isActive = false;
    await user.save();

    const result = await notificationService.notify({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Should not exist",
      message: "Test",
    });

    expect(result).toBeNull();
    const count = await Notification.countDocuments({
      userId,
      title: "Should not exist",
    });
    expect(count).toBe(0);
  });
});
