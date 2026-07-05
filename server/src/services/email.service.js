import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { emailTemplates } from "./email.templates.js";

let transporter = null;

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

const renderTemplate = (template, data) =>
  emailTemplates[template]?.(data) || emailTemplates.generic(data);

export const emailService = {
  async send(to, template, data) {
    const tpl = renderTemplate(template, data);

    if (env.NODE_ENV === "test") {
      return;
    }

    const transport = getTransporter();

    if (env.NODE_ENV === "development") {
      console.log(`[Email] To: ${to} | Subject: ${tpl.subject}`);
    }

    await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
    });
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
};
