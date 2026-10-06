import { env } from "../../config/env.js";
import { emailService } from "../../services/email.service.js";
import { resolveSiteLinkBase } from "../../services/siteBrand.js";
import {
  getRequestSite,
  getRequestSiteId,
} from "../../shared/requestContext.js";
import { Inquiry } from "../inquiries/inquiry.model.js";
import { Property } from "../properties/property.model.js";

function buildSourceUrl(site, pagePath) {
  const base = resolveSiteLinkBase(site);
  return pagePath ? `${base}${pagePath}` : base;
}

/** Client-supplied unit ids are only kept when the unit belongs to this site. */
async function resolveSiteUnitId(unitId, siteId) {
  if (!unitId) return null;
  const unit = await Property.exists({ _id: unitId, siteId });
  return unit ? unit._id : null;
}

export async function submitContactInquiry(payload) {
  // Honeypot filled: the caller answers exactly like a real success, but
  // nothing is stored or emailed.
  if (payload.website) return null;

  const site = getRequestSite();
  const siteId = getRequestSiteId();
  const sourceUrl = buildSourceUrl(site, payload.pagePath);

  // Store first so the inquiry survives any email delivery failure.
  const inquiry = await Inquiry.create({
    siteId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    residenceType: payload.residenceType,
    unitId: await resolveSiteUnitId(payload.unitId, siteId),
    unitLabel: payload.unitLabel,
    message: payload.message,
    pagePath: payload.pagePath,
    sourceUrl,
  });

  const inbox =
    site?.branding?.contactInboxEmail?.trim() || env.CONTACT_INBOX_EMAIL;
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  try {
    await emailService.sendContactInquiry(inbox, {
      fullName,
      email: payload.email,
      phone: payload.phone,
      residenceType: payload.residenceType,
      unitLabel: payload.unitLabel,
      message: payload.message,
      sourceUrl,
    });
  } catch (err) {
    console.error("Contact inquiry email failed:", err.message);
    return inquiry;
  }

  try {
    await Inquiry.updateOne(
      { _id: inquiry._id },
      { $set: { emailDelivered: true } },
    );
    inquiry.emailDelivered = true;
  } catch (err) {
    console.error("Contact inquiry delivery flag failed:", err.message);
  }

  try {
    await emailService.sendContactAutoReply(payload.email, {
      name: payload.firstName,
    });
  } catch (err) {
    console.error("Contact auto-reply email failed:", err.message);
  }

  return inquiry;
}
