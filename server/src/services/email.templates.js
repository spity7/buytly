const APP_NAME = "Buytly";

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
  subject,
  preheader,
  greeting,
  paragraphs = [],
  cta,
  footer = `You received this email from ${APP_NAME}. If you did not expect this message, you can safely ignore it.`,
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
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">${APP_NAME}</p>
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

  const textLines = [APP_NAME, "", greeting, ...paragraphs];

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

const optionalCta = (ctaUrl, ctaLabel) =>
  ctaUrl && ctaLabel ? { label: ctaLabel, url: ctaUrl } : undefined;

export const emailTemplates = {
  welcome: ({ name }) =>
    buildBrandedEmail({
      subject: "Welcome to Buytly",
      preheader: "Your account is ready. Start exploring properties on Buytly.",
      greeting: `Hi ${name},`,
      paragraphs: [
        "Thanks for joining Buytly. Your account has been created successfully.",
        "You can sign in anytime to browse listings, save favorites, and manage bookings.",
      ],
      footer:
        "You received this email because you created a Buytly account. If you did not sign up, you can ignore this message.",
    }),

  emailVerification: ({ name, verifyUrl }) =>
    buildBrandedEmail({
      subject: "Confirm your Buytly account",
      preheader: "One quick step to finish setting up your Buytly account.",
      greeting: `Hi ${name},`,
      paragraphs: [
        "Thanks for signing up for Buytly. Please confirm your email address to activate your account.",
        "This confirmation link expires in 24 hours.",
      ],
      cta: {
        label: "Confirm email address",
        url: verifyUrl,
      },
      footer:
        "You received this email because someone signed up for Buytly with this address. If that was not you, you can ignore this message.",
    }),

  passwordReset: ({ name, resetUrl }) =>
    buildBrandedEmail({
      subject: "Reset your Buytly password",
      preheader:
        "Use this secure link to choose a new password for your Buytly account.",
      greeting: `Hi ${name},`,
      paragraphs: [
        "We received a request to reset the password for your Buytly account.",
        "This link expires in 1 hour. If you did not request a password reset, you can ignore this email.",
      ],
      cta: {
        label: "Reset my password",
        url: resetUrl,
      },
      footer:
        "You received this email because a password reset was requested for your Buytly account.",
    }),

  passwordChanged: ({ name, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      subject: "Your Buytly password was changed",
      preheader: "Your account password was updated successfully.",
      greeting: `Hi ${name},`,
      paragraphs: [
        "This is a confirmation that the password for your Buytly account was changed.",
        "If you did not make this change, contact support immediately.",
      ],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer:
        "You received this email because your Buytly account password was changed.",
    }),

  bookingStatus: ({ name, status, propertyTitle, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      subject: `Booking update: ${status}`,
      preheader: `Your booking for ${propertyTitle} is now ${status}.`,
      greeting: `Hi ${name},`,
      paragraphs: [
        `Your booking for "${propertyTitle}" has been updated to ${status}.`,
        "Sign in to Buytly to view the full details.",
      ],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer:
        "You received this email because you have an active booking on Buytly.",
    }),

  transactionUpdate: ({ name, status, propertyTitle, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      subject: `Transaction update: ${status}`,
      preheader: `Your transaction for ${propertyTitle} is now ${status}.`,
      greeting: `Hi ${name},`,
      paragraphs: [
        `Your transaction for "${propertyTitle}" is now ${status}.`,
        "Sign in to Buytly to view the full details.",
      ],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer:
        "You received this email because you have an active transaction on Buytly.",
    }),

  propertyStatus: ({
    name,
    status,
    propertyTitle,
    message,
    ctaUrl,
    ctaLabel,
  }) =>
    buildBrandedEmail({
      subject: `Listing update: ${status}`,
      preheader: message || `Your listing "${propertyTitle}" is now ${status}.`,
      greeting: `Hi ${name || "there"},`,
      paragraphs: [
        message || `Your listing "${propertyTitle}" is now ${status}.`,
        "Sign in to Buytly to view the full details.",
      ],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer:
        "You received this email because you have a listing on Buytly.",
    }),

  newReview: ({ name, propertyTitle, rating, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      subject: `New review for ${propertyTitle}`,
      preheader: `Your listing received a ${rating}-star review.`,
      greeting: `Hi ${name || "there"},`,
      paragraphs: [
        `Your listing "${propertyTitle}" received a ${rating}-star review.`,
        "Sign in to Buytly to read the full feedback.",
      ],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer:
        "You received this email because you manage a listing on Buytly.",
    }),

  generic: ({ title, message, ctaUrl, ctaLabel }) =>
    buildBrandedEmail({
      subject: title,
      preheader: message,
      greeting: "Hello,",
      paragraphs: [message],
      cta: optionalCta(ctaUrl, ctaLabel),
      footer: `You received this notification from ${APP_NAME}.`,
    }),
};
