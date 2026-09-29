import { env } from "../../config/env.js";
import { emailService } from "../../services/email.service.js";
import { getRequestSite } from "../../shared/requestContext.js";

export async function submitContactInquiry(payload) {
  const site = getRequestSite();
  const inbox =
    site?.contactInboxEmail?.trim() || env.CONTACT_INBOX_EMAIL;
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  await emailService.sendContactInquiry(inbox, {
    fullName,
    email: payload.email,
    message: payload.message,
    sourceUrl: env.APP_URL,
  });

  await emailService.sendContactAutoReply(payload.email, {
    name: payload.firstName,
  });
}
