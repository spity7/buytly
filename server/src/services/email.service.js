import nodemailer from "nodemailer";
import { env } from "../config/env.js";

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

const templates = {
  welcome: ({ name }) => ({
    subject: "Welcome to Buytly",
    html: `<h1>Welcome, ${name}!</h1><p>Your Buytly account has been created successfully.</p>`,
  }),
  passwordReset: ({ name, resetUrl }) => ({
    subject: "Reset your Buytly password",
    html: `<h1>Password Reset</h1><p>Hi ${name},</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in 1 hour.</p>`,
  }),
  emailVerification: ({ name, verifyUrl }) => ({
    subject: "Verify your Buytly email",
    html: `<h1>Verify your email</h1><p>Hi ${name},</p><p><a href="${verifyUrl}">Click here to verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  }),
  bookingStatus: ({ name, status, propertyTitle }) => ({
    subject: `Booking ${status} - Buytly`,
    html: `<h1>Booking Update</h1><p>Hi ${name},</p><p>Your booking for "${propertyTitle}" has been ${status}.</p>`,
  }),
  transactionUpdate: ({ name, status, propertyTitle }) => ({
    subject: `Transaction ${status} - Buytly`,
    html: `<h1>Transaction Update</h1><p>Hi ${name},</p><p>Your transaction for "${propertyTitle}" is now ${status}.</p>`,
  }),
  generic: ({ title, message }) => ({
    subject: title,
    html: `<h1>${title}</h1><p>${message}</p>`,
  }),
};

export const emailService = {
  async send(to, template, data) {
    const tpl = templates[template]?.(data) || templates.generic(data);

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
