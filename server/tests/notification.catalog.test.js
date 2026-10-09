import { describe, it, expect } from "vitest";
import {
  buildNotificationPayload,
  buildHref,
  getNotificationEvent,
} from "../src/modules/notifications/notification.catalog.js";
import {
  normalizeNotificationPreferences,
  shouldDeliverNotification,
} from "../src/modules/notifications/notification.preferences.js";

describe("notification catalog", () => {
  it("builds booking.created payload with href and entity data", () => {
    const payload = buildNotificationPayload("booking.created", {
      bookingId: "507f1f77bcf86cd799439011",
      propertyId: "507f1f77bcf86cd799439012",
      propertyTitle: "Sea View Apartment",
    });

    expect(payload.type).toBe("booking");
    expect(payload.title).toBe("New Visit Request");
    expect(payload.message).toContain("Sea View Apartment");
    expect(payload.data.event).toBe("booking.created");
    expect(payload.data.entityId).toBe("507f1f77bcf86cd799439011");
    expect(payload.data.propertyId).toBe("507f1f77bcf86cd799439012");
    expect(payload.data.href).toBe(
      "/dashboard-bookings?highlight=507f1f77bcf86cd799439011",
    );
  });

  it("builds admin review href for pending listings", () => {
    expect(
      buildHref("property.pending_review", {
        propertyId: "507f1f77bcf86cd799439011",
      }),
    ).toBe("/dashboard-admin-properties?highlight=507f1f77bcf86cd799439011");
  });

  it("builds property review href to listing reviews section", () => {
    expect(
      buildHref("review.received", {
        propertyId: "507f1f77bcf86cd799439011",
      }),
    ).toBe("/single-v1/507f1f77bcf86cd799439011#property-reviews");
  });

  it("throws for unknown events", () => {
    expect(() => getNotificationEvent("unknown.event")).toThrow(
      "Unknown notification event",
    );
  });
});

describe("notification preferences", () => {
  it("defaults all channels to enabled", () => {
    const prefs = normalizeNotificationPreferences(undefined);
    expect(prefs.email.booking).toBe(true);
    expect(prefs.inApp.transaction).toBe(true);
  });

  it("respects email opt-out per category", () => {
    const user = {
      notificationPreferences: {
        email: { booking: false },
        inApp: { booking: true },
      },
    };

    expect(shouldDeliverNotification(user, "booking", "email")).toBe(false);
    expect(shouldDeliverNotification(user, "booking", "inApp")).toBe(true);
  });
});
