import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";
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
export function getListingContactViewerMode(property, viewerUser, contact) {
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
          ? `/dashboard-edit-property/${propertyId}`
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

export function getListingContactCta(contact, viewerMode = { mode: "public" }) {
  if (!contact) {
    return null;
  }

  if (viewerMode.mode === "self-contact") {
    if (!viewerMode.manageHref) {
      return null;
    }
    return {
      href: viewerMode.manageHref,
      label: viewerMode.isOwner ? "Edit listing" : "Go to dashboard",
    };
  }

  if (viewerMode.mode === "owner-preview-agent") {
    if (contact.profileHref) {
      return {
        href: contact.profileHref,
        label: "View assigned agent",
      };
    }
    if (contact.phone) {
      return {
        href: `tel:${contact.phone}`,
        label: "Call assigned agent",
      };
    }
    return null;
  }

  if (contact.phone) {
    return {
      href: `tel:${contact.phone}`,
      label: contact.kind === "agent" ? "Contact Agent" : "Contact listing",
    };
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
