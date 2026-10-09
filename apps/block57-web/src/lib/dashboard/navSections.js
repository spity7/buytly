import { canManageListings } from "@/lib/auth/roles";

/**
 * Block 57 hides Bookings, Transactions, Saved Search and Reviews: nothing on
 * the site creates them. The pages stay reachable by URL.
 */
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
                icon: "flaticon-corporation",
                text: "My Projects",
              },
              {
                href: "/dashboard-my-properties",
                icon: "flaticon-door",
                text: "All Units",
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
                href: "/dashboard-admin-inquiries",
                icon: "flaticon-email",
                text: "Inquiries",
              },
              {
                href: "/dashboard-admin-users",
                icon: "flaticon-user",
                text: "Users",
              },
              {
                href: "/dashboard-admin-properties",
                icon: "flaticon-protection",
                text: "Moderate Listings",
              },
              {
                href: "/dashboard-admin-projects",
                icon: "flaticon-hotel",
                text: "Moderate Projects",
              },
              {
                href: "/dashboard-admin-catalog",
                icon: "flaticon-network",
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
          icon: "flaticon-favourite",
          text: "My Favorites",
        },
      ],
    },
    {
      title: "MANAGE ACCOUNT",
      items: [
        {
          href: "/dashboard-my-profile",
          icon: "flaticon-user-1",
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
