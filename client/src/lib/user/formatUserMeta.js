const ROLE_LABELS = {
  buyer: "Buyer",
  seller: "Seller",
  agent: "Agent",
  admin: "Admin",
};

export function formatUserRole(role) {
  return ROLE_LABELS[role] || role || "User";
}

export function formatMemberSince(createdAt) {
  if (!createdAt) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(createdAt));
}

export function formatUserDisplayName(user) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || user?.email || "Your profile";
}
