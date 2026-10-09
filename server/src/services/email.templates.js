import { DEFAULT_BRAND_NAME } from "./siteBrand.js";

const escapeHtml = (value) => {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const buildBrandedEmail = ({
  appName,
  subject,
  preheader,
  greeting,
  paragraphs = [],
  cta,
  footer = `You received this email from ${appName}. If you did not expect this message, you can safely ignore it.`,
}) => {
  const safeGreeting = escapeHtml(greeting);
  const paragraphHtml = paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#374151;">${escapeHtml(text)}</p>`,
    )
    .join("");

  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="border-radius:6px;background-color:#2563eb;">
            <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(cta.label)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:14px;line-height:20px;color:#6b7280;">Or copy and paste this link into your browser:</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:20px;color:#2563eb;word-break:break-all;">${escapeHtml(cta.url)}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;background-color:#111827;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">${escapeHtml(appName)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#111827;">${safeGreeting}</p>
              ${paragraphHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;line-height:18px;color:#9ca3af;">${escapeHtml(footer)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [appName, "", greeting, ...paragraphs];

  if (cta) {
    textLines.push("", `${cta.label}:`, cta.url);
  }

  textLines.push("", "---", footer);

  return {
    subject,
    html,
    text: textLines.join("\n"),
  };
};

const INQUIRY_TOPIC_LABELS = {
  inquiry: "Inquiry",
  contact: "Contact",
  tour: "Tour request",
};

/** "2026-10-20" → "Tuesday 20 October 2026"; other values are returned as-is. */
const formatCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(`${value}T00:00:00Z`);
  const part = (options) =>
    date.toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
  return `${part({ weekday: "long" })} ${Number(match[3])} ${part({ month: "long" })} ${match[1]}`;
};

const optionalCta = (ctaUrl, ctaLabel) =>
  ctaUrl && ctaLabel ? { label: ctaLabel, url: ctaUrl } : undefined;

/**
 * Every template takes `{ brand, ...params }`. `brand.name` is the site display
 * name resolved by email.service (siteBrand.js); without it, DEFAULT_BRAND_NAME.
 */
const withBrand =
  (render) =>
  ({ brand, ...params } = {}) =>
    render({ ...params, appName: brand?.name?.trim() || DEFAULT_BRAND_NAME });

export const emailTemplates = {
  welcome: withBrand(({ appName, name }) =>
    buildBrandedEmail({
      appName,
      subject: `Welcome to ${appName}`,
      preheader: `Your account is ready. Start exploring properties on ${appName}.`,
      greeting: `Hi ${name},`,
      paragraphs: [
        `Thanks for joining ${appName}. Your account has been created successfully.`,
        "You can sign in anytime to browse listings, save favorites, and manage bookings.",
      ],
      footer: `You received this email because you created a ${appName} account. If you did not sign up, you can ignore this message.`,
    }),
  ),

  emailVerification: withBrand(({ appName, name, verifyUrl }) =>
    buildBrandedEmail({
      appName,
      subject: `Confirm your ${appName} account`,
      preheader: `One quick step to finish setting up your ${appName} account.`,
      greeting: `Hi ${name},`,
      paragraphs: [
        `Thanks for signing up for ${appName}. Please confirm your email address to activate your account.`,
        "This confirmation link expires in 24 hours.",
      ],
      cta: {
        label: "Confirm email address",
        url: verifyUrl,
      },
      footer: `You received this email because someone signed up for ${appName} with this address. If that was not you, you can ignore this message.`,
    }),
  ),

  passwordReset: withBrand(({ appName, name, resetUrl }) =>
    buildBrandedEmail({
      appName,
      subject: `Reset your ${appName} password`,
      preheader: `Use this secure link to choose a new password for your ${appName} account.`,
      greeting: `Hi ${name},`,
      paragraphs: [
        `We received a request to reset the password for your ${appName} account.`,
        "This link expires in 1 hour. If you did not request a password reset, you can ignore this email.",
      ],
      cta: {
        label: "Reset my password",
        url: resetUrl,
      },
      footer: `You received this email because a password reset was requested for your ${appName} account.`,
    }),
  ),

  passwordChanged: withBrand(({ appName, name, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      appName,
      subject: `Your ${appName} password was changed`,
      preheader: "Your account password was updated successfully.",
      greeting: `Hi ${name},`,
      paragraphs: [
        `This is a confirmation that the password for your ${appName} account was changed.`,
        "If you did not make this change, contact support immediately.",
      ],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer: `You received this email because your ${appName} account password was changed.`,
    }),
  ),

  bookingStatus: withBrand(
    ({ appName, name, status, propertyTitle, ctaUrl, ctaLabel }) =>
      buildBrandedEmail({
        appName,
        subject: `Booking update: ${status}`,
        preheader: `Your booking for ${propertyTitle} is now ${status}.`,
        greeting: `Hi ${name},`,
        paragraphs: [
          `Your booking for "${propertyTitle}" has been updated to ${status}.`,
          `Sign in to ${appName} to view the full details.`,
        ],
        cta: optionalCta(ctaUrl, ctaLabel),
        footer: `You received this email because you have an active booking on ${appName}.`,
      }),
  ),

  transactionUpdate: withBrand(
    ({ appName, name, status, propertyTitle, ctaUrl, ctaLabel }) =>
      buildBrandedEmail({
        appName,
        subject: `Transaction update: ${status}`,
        preheader: `Your transaction for ${propertyTitle} is now ${status}.`,
        greeting: `Hi ${name},`,
        paragraphs: [
          `Your transaction for "${propertyTitle}" is now ${status}.`,
          `Sign in to ${appName} to view the full details.`,
        ],
        cta: optionalCta(ctaUrl, ctaLabel),
        footer: `You received this email because you have an active transaction on ${appName}.`,
      }),
  ),

  propertyStatus: withBrand(
    ({ appName, name, status, propertyTitle, message, ctaUrl, ctaLabel }) =>
      buildBrandedEmail({
        appName,
        subject: `Listing update: ${status}`,
        preheader:
          message || `Your listing "${propertyTitle}" is now ${status}.`,
        greeting: `Hi ${name || "there"},`,
        paragraphs: [
          message || `Your listing "${propertyTitle}" is now ${status}.`,
          `Sign in to ${appName} to view the full details.`,
        ],
        cta: optionalCta(ctaUrl, ctaLabel),
        footer: `You received this email because you have a listing on ${appName}.`,
      }),
  ),

  newReview: withBrand(
    ({ appName, name, propertyTitle, rating, ctaUrl, ctaLabel }) =>
      buildBrandedEmail({
        appName,
        subject: `New review for ${propertyTitle}`,
        preheader: `Your listing received a ${rating}-star review.`,
        greeting: `Hi ${name || "there"},`,
        paragraphs: [
          `Your listing "${propertyTitle}" received a ${rating}-star review.`,
          `Sign in to ${appName} to read the full feedback.`,
        ],
        cta: optionalCta(ctaUrl, ctaLabel),
        footer: `You received this email because you manage a listing on ${appName}.`,
      }),
  ),

  generic: withBrand(({ appName, title, message, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      appName,
      subject: title,
      preheader: message,
      greeting: "Hello,",
      paragraphs: [message],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer: `You received this notification from ${appName}.`,
    }),
  ),

  contactInquiry: withBrand(
    ({
      appName,
      fullName,
      email,
      phone,
      residenceType,
      unitLabel,
      message,
      topic,
      preferredDate,
      preferredTime,
      sourceUrl,
    }) => {
      const isTour = topic === "tour";
      // Some forms have no name field; the email address always identifies the sender.
      const sender = fullName || email;
      return buildBrandedEmail({
        appName,
        subject: `${appName} ${isTour ? "tour request" : "contact form"} — ${sender}`,
        preheader: `New ${isTour ? "tour request" : "message"} from ${email}`,
        greeting: "Hello,",
        paragraphs: [
          isTour
            ? `You received a new tour request via the ${appName} website.`
            : `You received a new message via the ${appName} contact form.`,
          `From: ${fullName || "—"}`,
          `Reply-To email: ${email}`,
          `Topic: ${INQUIRY_TOPIC_LABELS[topic] ?? INQUIRY_TOPIC_LABELS.inquiry}`,
          phone ? `Phone: ${phone}` : null,
          residenceType ? `Residence type: ${residenceType}` : null,
          unitLabel ? `Unit: ${unitLabel}` : null,
          preferredDate
            ? `Preferred date: ${formatCalendarDate(preferredDate)}`
            : null,
          preferredTime ? `Preferred time: ${preferredTime}` : null,
          sourceUrl ? `Submitted from: ${sourceUrl}` : null,
          "",
          message,
        ].filter((line) => line != null && line !== ""),
        footer: `Reply directly to this email to reach ${sender}.`,
      });
    },
  ),

  contactAutoReply: withBrand(
    ({ appName, name, topic, preferredDate, preferredTime }) => {
      const isTour = topic === "tour";
      const preferred = [
        preferredDate && formatCalendarDate(preferredDate),
        preferredTime,
      ]
        .filter(Boolean)
        .join(", ");
      return buildBrandedEmail({
        appName,
        subject: `We received your ${isTour ? "tour request" : "message"} — ${appName}`,
        preheader: `Thanks for contacting ${appName}.`,
        greeting: name ? `Hi ${name},` : "Hello,",
        paragraphs: [
          isTour
            ? `Thank you for requesting a tour${preferred ? ` (preferred: ${preferred})` : ""}. We have received your request and will contact you to confirm the visit.`
            : "Thank you for reaching out. We have received your message and will get back to you as soon as possible.",
          "If your inquiry is urgent, you can also reach us on WhatsApp from our website.",
        ],
        footer: `You received this email because you submitted the contact form on ${appName}.`,
      });
    },
  ),
};
