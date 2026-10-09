import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { env } from "../config/env.js";
import { emailTemplates } from "./email.templates.js";
import { resolveSiteBrand } from "./siteBrand.js";

let transporter = null;
let sendgridReady = false;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const ensureSendgrid = () => {
  if (!sendgridReady) {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    sendgridReady = true;
  }
};

/**
 * Sender for a site: the SMTP_FROM address with the site brand as display name,
 * e.g. `Block 57 <noreply@buytly.com>`. env.js only accepts a plain address; the
 * `Name <addr>` parsing is defensive.
 */
export const buildEmailSender = (smtpFrom, brandName) => {
  const raw = String(smtpFrom || "").trim();
  const address = (raw.match(/<([^<>]+)>\s*$/)?.[1] ?? raw).trim();
  const name = String(brandName || "").trim();
  return name ? { name, address } : { address };
};

const renderTemplate = (template, data, brand) => {
  const payload = { ...data, brand };
  return emailTemplates[template]?.(payload) || emailTemplates.generic(payload);
};

const deliver = async (to, tpl, options = {}) => {
  const { replyTo, brand } = options;
  const sender = buildEmailSender(env.SMTP_FROM, brand?.name);
  if (env.EMAIL_PROVIDER === "sendgrid") {
    ensureSendgrid();
    await sgMail.send({
      to,
      from: { email: sender.address, name: sender.name },
      replyTo: replyTo || undefined,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
    });
    return;
  }

  const transport = getTransporter();
  await transport.sendMail({
    from: sender,
    to,
    replyTo: replyTo || undefined,
    subject: tpl.subject,
    text: tpl.text,
    html: tpl.html,
  });
};

export const emailService = {
  async send(to, template, data, options = {}) {
    const brand = resolveSiteBrand();
    const tpl = renderTemplate(template, data, brand);

    if (env.NODE_ENV === "test") {
      return;
    }

    if (env.NODE_ENV === "development") {
      console.log(`[Email] To: ${to} | Subject: ${tpl.subject}`);
    }

    await deliver(to, tpl, { ...options, brand });
  },

  async sendPasswordReset(to, data) {
    return this.send(to, "passwordReset", data);
  },

  async sendEmailVerification(to, data) {
    return this.send(to, "emailVerification", data);
  },

  async sendWelcome(to, data) {
    return this.send(to, "welcome", data);
  },

  async sendBookingStatus(to, data) {
    return this.send(to, "bookingStatus", data);
  },

  async sendTransactionUpdate(to, data) {
    return this.send(to, "transactionUpdate", data);
  },

  async sendContactInquiry(inbox, data) {
    const brand = resolveSiteBrand();
    const tpl = renderTemplate("contactInquiry", data, brand);

    if (env.NODE_ENV === "test") {
      return;
    }

    if (env.NODE_ENV === "development") {
      console.log(
        `[Email] Contact inquiry To: ${inbox} | Reply-To: ${data.email} | Subject: ${tpl.subject}`,
      );
    }

    await deliver(inbox, tpl, { replyTo: data.email, brand });
  },

  /** Replies to the auto-reply go to the site's support inbox when it has one. */
  async sendContactAutoReply(to, data) {
    const { supportEmail } = resolveSiteBrand();
    return this.send(to, "contactAutoReply", data, {
      replyTo: supportEmail || undefined,
    });
  },
};
