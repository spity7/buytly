export const LISTING_ROLES = new Set(["seller", "agent", "admin"]);

export function canManageListings(role) {
  return LISTING_ROLES.has(role);
}
