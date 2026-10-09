import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";
import { buildWhatsAppUrl, getPublicSiteOrigin } from "@/lib/phone/whatsapp";
import {
  formatUserDisplayName,
  formatUserRole,
} from "@/lib/user/formatUserMeta";

const PLACEHOLDER_AVATAR = "/images/listings/profile-1.jpg";

export function getPopulatedUserId(userRef) {
  if (!userRef) {
    return null;
  }
  if (typeof userRef === "string") {
    return userRef;
  }
  const id = userRef._id || userRef.id;
  return id ? String(id) : null;
}

export function getPropertyId(property) {
  if (!property) {
    return null;
  }
  const id = property._id || property.id;
  return id ? String(id) : null;
}

export function isUserListingOwner(property, userId) {
  if (!property || !userId) {
    return false;
  }
  return getPopulatedUserId(property.ownerId) === String(userId);
}

/** Owner or assigned listing agent (matches server `canManageProperty`). */
export function isUserListingManager(property, userId) {
  if (!property || !userId) {
    return false;
  }
  const uid = String(userId);
  return (
    getPopulatedUserId(property.ownerId) === uid ||
    getPopulatedUserId(property.agentId) === uid
  );
}

/**
 * How the listing contact card should behave for the current viewer.
 * - public: buyer / guest
 * - self-contact: viewer is the person shown in the card
 * - owner-preview-agent: owner previewing the assigned agent buyers will see
 */
export function getListingContactViewerMode(
  property,
  viewerUser,
  contact,
  { manageEditBase = "/dashboard-edit-property" } = {},
) {
  const viewerId = getPopulatedUserId(viewerUser);
  if (!viewerId || !contact) {
    return { mode: "public" };
  }

  const isSelf = String(contact.id) === viewerId;
  const isOwner = isUserListingOwner(property, viewerId);
  const isManager = isUserListingManager(property, viewerId);
  const propertyId = getPropertyId(property);

  if (isSelf) {
    return {
      mode: "self-contact",
      isOwner,
      isManager,
      manageHref:
        isManager && propertyId
          ? `${manageEditBase}/${propertyId}`
          : "/dashboard-my-profile",
    };
  }

  if (isOwner && contact.kind === "agent") {
    return { mode: "owner-preview-agent" };
  }

  return { mode: "public" };
}

export function resolveListingContactPhone(contact) {
  if (!contact || typeof contact !== "object") {
    return null;
  }

  const direct = contact.phone?.trim();
  if (direct) {
    return direct;
  }

  const code = contact.phoneCountryCode?.trim();
  const number = contact.phoneNumber?.trim();
  if (code && number) {
    return `${code}${number}`;
  }
  if (number) {
    return number;
  }

  return null;
}

export function resolveListingContactAvatarUrl(contact) {
  const url = contact?.avatar?.url;
  if (typeof url === "string" && url.trim()) {
    return url.trim();
  }
  return PLACEHOLDER_AVATAR;
}

function mapPopulatedListingContact(contact, kind) {
  if (!contact || typeof contact === "string") {
    return null;
  }

  const id = contact._id || contact.id;
  if (!id) {
    return null;
  }

  const role = contact.role;
  const avatarUrl = resolveListingContactAvatarUrl(contact);
  const hasAgentProfile = kind === "agent" || role === "agent";

  return {
    id: String(id),
    kind,
    name: formatUserDisplayName(contact),
    roleLabel: formatUserRole(role),
    email: contact.email?.trim() || null,
    phone: resolveListingContactPhone(contact),
    avatarUrl,
    avatarUnoptimized: isExternalImageSrc(avatarUrl),
    profileHref: hasAgentProfile ? `/agent-single/${id}` : null,
  };
}

export function getListingContact(property) {
  if (!property) {
    return null;
  }

  const agent = mapPopulatedListingContact(property.agentId, "agent");
  if (agent) {
    return agent;
  }

  return mapPopulatedListingContact(property.ownerId, "owner");
}

export function getListingContactWhatsAppContext(listing) {
  if (!listing) {
    return null;
  }

  const title = listing.title?.trim() || "this listing";
  const slug = listing.slug?.trim();
  let listingPath = null;

  if (slug) {
    listingPath = `/project/${slug}`;
  } else {
    const id = getPropertyId(listing);
    if (id) {
      listingPath = `/single-v1/${id}`;
    }
  }

  return { title, listingPath };
}

export function buildListingContactWhatsAppMessage(
  context,
  siteOrigin = getPublicSiteOrigin(),
) {
  if (!context) {
    return undefined;
  }

  const lines = [`Hi, I'm interested in "${context.title}" on Buytly.`];
  if (context.listingPath) {
    const origin = siteOrigin?.replace(/\/$/, "");
    lines.push(
      origin ? `${origin}${context.listingPath}` : context.listingPath,
    );
  }

  return lines.join("\n");
}

function buildListingWhatsAppCta(contact, message, label) {
  const href = buildWhatsAppUrl(contact.phone, { text: message });
  if (!href) {
    return null;
  }

  return {
    href,
    label,
    external: true,
  };
}

export function getListingContactCta(
  contact,
  viewerMode = { mode: "public" },
  { selfManageLabel = "Edit listing", listingContext = null } = {},
) {
  if (!contact) {
    return null;
  }

  if (viewerMode.mode === "self-contact") {
    if (!viewerMode.manageHref) {
      return null;
    }
    return {
      href: viewerMode.manageHref,
      label: viewerMode.isOwner ? selfManageLabel : "Go to dashboard",
    };
  }

  const whatsappMessage = buildListingContactWhatsAppMessage(listingContext);

  if (viewerMode.mode === "owner-preview-agent") {
    if (contact.profileHref) {
      return {
        href: contact.profileHref,
        label: "View assigned agent",
      };
    }
    return buildListingWhatsAppCta(
      contact,
      whatsappMessage,
      "WhatsApp assigned agent",
    );
  }

  if (contact.phone) {
    return buildListingWhatsAppCta(
      contact,
      whatsappMessage,
      contact.kind === "agent" ? "WhatsApp Agent" : "WhatsApp listing contact",
    );
  }

  if (contact.profileHref) {
    return {
      href: contact.profileHref,
      label: "Contact Agent",
    };
  }

  if (contact.email) {
    return {
      href: `mailto:${contact.email}`,
      label: "Contact listing",
    };
  }

  return null;
}

export function getListingContactHint(viewerMode) {
  if (!viewerMode || viewerMode.mode === "public") {
    return null;
  }
  if (viewerMode.mode === "self-contact") {
    return viewerMode.isOwner
      ? "You are the public contact for this listing. Buyers reach you using the details below."
      : "You are the public contact for this listing.";
  }
  if (viewerMode.mode === "owner-preview-agent") {
    return "Buyers are directed to your assigned listing agent.";
  }
  return null;
}

export { PLACEHOLDER_AVATAR };
