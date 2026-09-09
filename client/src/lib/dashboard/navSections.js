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
                href: "/dashboard-add-property",
                icon: "flaticon-new-tab",
                text: "Add New Property",
              },
              {
                href: "/dashboard-my-properties",
                icon: "flaticon-home",
                text: "My Properties",
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
