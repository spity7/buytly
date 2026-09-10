import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { env } from "../config/env.js";
import { emailTemplates } from "./email.templates.js";

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

const renderTemplate = (template, data) =>
  emailTemplates[template]?.(data) || emailTemplates.generic(data);

const deliver = async (to, tpl) => {
  if (env.EMAIL_PROVIDER === "sendgrid") {
    ensureSendgrid();
    await sgMail.send({
      to,
      from: env.SMTP_FROM,
      subject: tpl.subject,
      text: tpl.text,
      html: tpl.html,
    });
    return;
  }

  const transport = getTransporter();
  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: tpl.subject,
    text: tpl.text,
    html: tpl.html,
  });
};

export const emailService = {
  async send(to, template, data) {
    const tpl = renderTemplate(template, data);

    if (env.NODE_ENV === "test") {
      return;
    }

    if (env.NODE_ENV === "development") {
      console.log(`[Email] To: ${to} | Subject: ${tpl.subject}`);
    }

    await deliver(to, tpl);
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
