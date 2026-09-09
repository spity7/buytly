export const homeItems = [{ href: "/", label: "Home" }];

export const listingItems = [
  {
    title: "Listings",
    submenu: [{ label: "Browse Listings", href: "/listings" }],
  },
];

export const propertyItems = [
  {
    label: "Agents",
    subMenuItems: [{ label: "Find an Agent", href: "/agents" }],
  },
  {
    label: "Dashboard",
    subMenuItems: [
      { label: "Dashboard Home", href: "/dashboard-home" },
      { label: "New Property", href: "/dashboard-add-property" },
      { label: "My Properties", href: "/dashboard-my-properties" },
      { label: "My Favorites", href: "/dashboard-my-favourites" },
      { label: "Saved Search", href: "/dashboard-saved-search" },
      { label: "My Profile", href: "/dashboard-my-profile" },
    ],
  },
];

export const blogItems = [];

export const pageItems = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "Faq" },
  { href: "/contact", label: "Contact" },
];
