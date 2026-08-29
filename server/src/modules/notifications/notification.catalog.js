import { NOTIFICATION_TYPES } from "../../shared/constants.js";
import { env } from "../../config/env.js";

const statusMessages = {
  active: "Your listing has been approved and is now live.",
  draft: "Your listing was returned for edits.",
  archived: "Your listing has been archived.",
  pending: "Your listing is still under review.",
  sold: "Your listing was marked as sold.",
  rented: "Your listing was marked as rented.",
};

const toId = (value) => {
  if (!value) return undefined;
  return value._id?.toString?.() || value.toString?.() || String(value);
};

export const NOTIFICATION_EVENTS = {
  "auth.welcome": {
    type: NOTIFICATION_TYPES.AUTH,
    preferenceKey: "auth",
    defaultSendEmail: true,
    emailTemplate: "welcome",
    entityType: "user",
    buildTitle: () => "Welcome to Buytly",
    buildMessage: () => "Your account has been created successfully.",
    buildHref: () => "/dashboard-home",
    buildEmailData: ({ name }) => ({ name }),
  },
  "auth.email_verified": {
    type: NOTIFICATION_TYPES.AUTH,
    preferenceKey: "auth",
    defaultSendEmail: false,
    emailTemplate: "generic",
    entityType: "user",
    buildTitle: () => "Email verified",
    buildMessage: () => "Your email address has been verified successfully.",
    buildHref: () => "/dashboard-my-profile",
    buildEmailData: ({ name, title, message }) => ({ name, title, message }),
  },
  "auth.password_changed": {
    type: NOTIFICATION_TYPES.AUTH,
    preferenceKey: "auth",
    defaultSendEmail: true,
    emailTemplate: "passwordChanged",
    entityType: "user",
    buildTitle: () => "Password changed",
    buildMessage: () => "Your account password was changed successfully.",
    buildHref: () => "/dashboard-my-profile",
    buildEmailData: ({ name }) => ({
      name,
      ctaUrl: `${env.APP_URL}/dashboard-my-profile`,
      ctaLabel: "Review account settings",
    }),
  },
  "booking.created": {
    type: NOTIFICATION_TYPES.BOOKING,
    preferenceKey: "booking",
    defaultSendEmail: true,
    emailTemplate: "generic",
    entityType: "booking",
    buildTitle: () => "New Visit Request",
    buildMessage: ({ propertyTitle }) =>
      `A buyer requested a visit for "${propertyTitle}"`,
    buildHref: ({ bookingId }) =>
      bookingId
        ? `/dashboard-bookings?highlight=${bookingId}`
        : "/dashboard-bookings",
    buildEmailData: ({ propertyTitle, title, message }) => ({
      title,
      message,
      propertyTitle,
      ctaUrl: `${env.APP_URL}/dashboard-bookings`,
      ctaLabel: "View bookings",
    }),
  },
  "booking.status_updated": {
    type: NOTIFICATION_TYPES.BOOKING,
    preferenceKey: "booking",
    defaultSendEmail: true,
    emailTemplate: "bookingStatus",
    entityType: "booking",
    buildTitle: ({ status }) => `Booking ${status}`,
    buildMessage: ({ propertyTitle, status }) =>
      `Your visit request for "${propertyTitle}" has been ${status}`,
    buildHref: ({ bookingId }) =>
      bookingId
        ? `/dashboard-bookings?highlight=${bookingId}`
        : "/dashboard-bookings",
    buildEmailData: ({ name, status, propertyTitle, bookingId }) => ({
      name,
      status,
      propertyTitle,
      ctaUrl: bookingId
        ? `${env.APP_URL}/dashboard-bookings?highlight=${bookingId}`
        : `${env.APP_URL}/dashboard-bookings`,
      ctaLabel: "View booking",
    }),
  },
  "booking.cancelled": {
    type: NOTIFICATION_TYPES.BOOKING,
    preferenceKey: "booking",
    defaultSendEmail: false,
    emailTemplate: "generic",
    entityType: "booking",
    buildTitle: () => "Booking Cancelled",
    buildMessage: ({ propertyTitle }) =>
      propertyTitle
        ? `A buyer cancelled their visit request for "${propertyTitle}"`
        : "A buyer cancelled their visit request",
    buildHref: ({ bookingId }) =>
      bookingId
        ? `/dashboard-bookings?highlight=${bookingId}`
        : "/dashboard-bookings",
    buildEmailData: ({ title, message }) => ({ title, message }),
  },
  "transaction.created": {
    type: NOTIFICATION_TYPES.TRANSACTION,
    preferenceKey: "transaction",
    defaultSendEmail: true,
    emailTemplate: "generic",
    entityType: "transaction",
    buildTitle: () => "New Transaction Request",
    buildMessage: ({ transactionType, propertyTitle }) =>
      `A ${transactionType} transaction was initiated for "${propertyTitle}"`,
    buildHref: ({ transactionId }) =>
      transactionId
        ? `/dashboard-transactions?highlight=${transactionId}`
        : "/dashboard-transactions",
    buildEmailData: ({ propertyTitle, title, message, transactionId }) => ({
      title,
      message,
      propertyTitle,
      ctaUrl: transactionId
        ? `${env.APP_URL}/dashboard-transactions?highlight=${transactionId}`
        : `${env.APP_URL}/dashboard-transactions`,
      ctaLabel: "View transaction",
    }),
  },
  "transaction.status_updated": {
    type: NOTIFICATION_TYPES.TRANSACTION,
    preferenceKey: "transaction",
    defaultSendEmail: true,
    emailTemplate: "transactionUpdate",
    entityType: "transaction",
    buildTitle: ({ status }) => `Transaction ${status}`,
    buildMessage: ({ propertyTitle, status }) =>
      `Your transaction for "${propertyTitle}" is now ${status}`,
    buildHref: ({ transactionId }) =>
      transactionId
        ? `/dashboard-transactions?highlight=${transactionId}`
        : "/dashboard-transactions",
    buildEmailData: ({
      name,
      status,
      propertyTitle,
      transactionId,
    }) => ({
      name,
      status,
      propertyTitle,
      ctaUrl: transactionId
        ? `${env.APP_URL}/dashboard-transactions?highlight=${transactionId}`
        : `${env.APP_URL}/dashboard-transactions`,
      ctaLabel: "View transaction",
    }),
  },
  "property.pending_review": {
    type: NOTIFICATION_TYPES.PROPERTY,
    preferenceKey: "property",
    defaultSendEmail: true,
    emailTemplate: "generic",
    entityType: "property",
    buildTitle: () => "Listing pending review",
    buildMessage: ({ propertyTitle }) =>
      `"${propertyTitle}" was submitted and awaits approval.`,
    buildHref: ({ propertyId }) =>
      propertyId
        ? `/dashboard-admin-properties?highlight=${propertyId}`
        : "/dashboard-admin-properties",
    buildEmailData: ({ propertyTitle, title, message, propertyId }) => ({
      title,
      message,
      propertyTitle,
      ctaUrl: propertyId
        ? `${env.APP_URL}/dashboard-admin-properties?highlight=${propertyId}`
        : `${env.APP_URL}/dashboard-admin-properties`,
      ctaLabel: "Review listing",
    }),
  },
  "property.status_changed": {
    type: NOTIFICATION_TYPES.PROPERTY,
    preferenceKey: "property",
    defaultSendEmail: true,
    emailTemplate: "propertyStatus",
    entityType: "property",
    buildTitle: ({ status }) => `Listing status: ${status}`,
    buildMessage: ({ propertyTitle, status }) =>
      statusMessages[status] ||
      `Your listing "${propertyTitle}" is now ${status}.`,
    buildHref: ({ propertyId }) =>
      propertyId
        ? `/dashboard-my-properties?highlight=${propertyId}`
        : "/dashboard-my-properties",
    buildEmailData: ({ name, propertyTitle, status, propertyId, title, message }) => ({
      name,
      propertyTitle,
      status,
      title,
      message,
      ctaUrl: propertyId
        ? `${env.APP_URL}/dashboard-my-properties?highlight=${propertyId}`
        : `${env.APP_URL}/dashboard-my-properties`,
      ctaLabel: "View listing",
    }),
  },
  "review.received": {
    type: NOTIFICATION_TYPES.PROPERTY,
    preferenceKey: "property",
    defaultSendEmail: false,
    emailTemplate: "newReview",
    entityType: "property",
    buildTitle: () => "New property review",
    buildMessage: ({ propertyTitle, rating }) =>
      `Your listing "${propertyTitle}" received a ${rating}-star review.`,
    buildHref: ({ propertyId }) =>
      propertyId ? `/single-v1/${propertyId}#property-reviews` : "/dashboard-my-properties",
    buildEmailData: ({ name, propertyTitle, rating, propertyId }) => ({
      name,
      propertyTitle,
      rating,
      ctaUrl: propertyId
        ? `${env.APP_URL}/single-v1/${propertyId}#property-reviews`
        : `${env.APP_URL}/dashboard-my-properties`,
      ctaLabel: "View reviews",
    }),
  },
};

export const getNotificationEvent = (eventKey) => {
  const event = NOTIFICATION_EVENTS[eventKey];
  if (!event) {
    throw new Error(`Unknown notification event: ${eventKey}`);
  }
  return event;
};

export const buildNotificationPayload = (eventKey, context = {}) => {
  const event = getNotificationEvent(eventKey);
  const title = event.buildTitle(context);
  const message = event.buildMessage(context);
  const href = event.buildHref(context);

  const entityId =
    toId(context.bookingId) ||
    toId(context.transactionId) ||
    toId(context.propertyId) ||
    toId(context.userId);

  const data = {
    event: eventKey,
    entityType: event.entityType,
    ...(entityId ? { entityId } : {}),
    ...(toId(context.propertyId) ? { propertyId: toId(context.propertyId) } : {}),
    ...(context.status ? { status: context.status } : {}),
    href,
  };

  return {
    type: event.type,
    preferenceKey: event.preferenceKey,
    title,
    message,
    data,
    sendEmail: event.defaultSendEmail,
    emailTemplate: event.emailTemplate,
    emailData: event.buildEmailData({ ...context, title, message }),
  };
};

export const buildHref = (eventKey, context = {}) =>
  getNotificationEvent(eventKey).buildHref(context);
