import { canManageListings } from "@/lib/auth/roles";

export function getDashboardNavSections(role) {
  const canManageListingsNav = canManageListings(role);
  const isAdmin = role === "admin";

  return [
    {
      title: "MAIN",
      items: [
        {
          href: "/dashboard-home",
          icon: "flaticon-discovery",
          text: "Dashboard",
        },
        {
          href: "/dashboard-notifications",
          icon: "flaticon-bell",
          text: "Notifications",
        },
        {
          href: "/dashboard-bookings",
          icon: "flaticon-calendar",
          text: "Bookings",
        },
        {
          href: "/dashboard-transactions",
          icon: "flaticon-contract",
          text: "Transactions",
        },
      ],
    },
    ...(canManageListingsNav
      ? [
          {
            title: "MANAGE LISTINGS",
            items: [
              {
                href: "/dashboard-add-project",
                icon: "flaticon-new-tab",
                text: "Add New Project",
              },
              {
                href: "/dashboard-my-projects",
                icon: "flaticon-home",
                text: "My Projects",
              },
              {
                href: "/dashboard-my-properties",
                icon: "flaticon-home",
                text: "All Units",
              },
              {
                href: "/dashboard-reviews",
                icon: "flaticon-review",
                text: "Reviews",
              },
            ],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "ADMIN",
            items: [
              {
                href: "/dashboard-admin-analytics",
                icon: "flaticon-search-chart",
                text: "Analytics",
              },
              {
                href: "/dashboard-admin-users",
                icon: "flaticon-user",
                text: "Users",
              },
              {
                href: "/dashboard-admin-properties",
                icon: "flaticon-settings",
                text: "Moderate Listings",
              },
              {
                href: "/dashboard-admin-projects",
                icon: "flaticon-home",
                text: "Moderate Projects",
              },
              {
                href: "/dashboard-admin-catalog",
                icon: "flaticon-home",
                text: "Types & Amenities",
              },
            ],
          },
        ]
      : []),
    {
      title: canManageListingsNav ? "SAVED" : "MANAGE LISTINGS",
      items: [
        {
          href: "/dashboard-my-favourites",
          icon: "flaticon-like",
          text: "My Favorites",
        },
        {
          href: "/dashboard-saved-search",
          icon: "flaticon-search-2",
          text: "Saved Search",
        },
      ],
    },
    {
      title: "MANAGE ACCOUNT",
      items: [
        {
          href: "/dashboard-my-profile",
          icon: "flaticon-user",
          text: "My Profile",
        },
        {
          logout: true,
          icon: "flaticon-logout",
          text: "Logout",
        },
      ],
    },
  ];
}
