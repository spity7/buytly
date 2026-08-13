import { canManageListings } from "@/lib/auth/roles";

export function getDashboardNavSections(role) {
  const canManageListingsNav = canManageListings(role);

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
          href: "/dashboard-message",
          icon: "flaticon-chat-1",
          text: "Message",
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
        ...(canManageListingsNav
          ? [
              {
                href: "/dashboard-reviews",
                icon: "flaticon-review",
                text: "Reviews",
              },
            ]
          : []),
      ],
    },
    {
      title: "MANAGE ACCOUNT",
      items: [
        {
          href: "/dashboard-my-package",
          icon: "flaticon-protection",
          text: "My Package",
        },
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
