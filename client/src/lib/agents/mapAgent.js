const PLACEHOLDER_AVATAR = "/images/team/agent-1.png";

export function getAgentUserId(agent) {
  const userId = agent?.userId;
  if (!userId) return null;
  if (typeof userId === "string") return userId;
  return userId._id || userId.id || null;
}

export function getAgentDisplayName(agent) {
  const userId = agent?.userId;
  if (userId && typeof userId === "object") {
    const parts = [userId.firstName, userId.lastName].filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return "Agent";
}

export function getAgentAvatarUrl(agent) {
  const userId = agent?.userId;
  if (userId && typeof userId === "object" && userId.avatar?.url) {
    return userId.avatar.url;
  }
  return PLACEHOLDER_AVATAR;
}

export function mapAgentToCard(agent) {
  const id = getAgentUserId(agent);
  return {
    id,
    name: getAgentDisplayName(agent),
    image: getAgentAvatarUrl(agent),
    city: agent?.city || "",
    agency: agent?.agency || "",
    listingsCount: agent?.listingsCount ?? 0,
    rating: agent?.rating ?? 0,
    reviewCount: agent?.reviewCount ?? 0,
    specialties: agent?.specialties || [],
  };
}

export function mapAgentDetail(detail) {
  if (!detail) return null;

  const user = detail.user || {};
  const profile = detail.profile || {};
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Agent";

  return {
    id: user._id || user.id,
    name,
    avatarUrl: user.avatar?.url || PLACEHOLDER_AVATAR,
    agency: profile.agency || "Independent Agent",
    city: profile.city || "",
    bio: profile.bio || "",
    rating: profile.rating ?? 0,
    reviewCount: profile.reviewCount ?? 0,
    listingsCount: detail.listingsCount ?? 0,
    phone: user.phoneNumber
      ? `${user.phoneCountryCode || ""} ${user.phoneNumber}`.trim()
      : "",
    email: user.email || "",
    social: user.socialLinks || {},
  };
}
