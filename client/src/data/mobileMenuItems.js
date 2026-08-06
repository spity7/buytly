module.exports = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Listing",
    path: "/grid-full-4-col",
  },
  {
    label: "Property",
    subMenu: [
      {
        label: "Agents",
        subMenu: [
          { label: "Agents", path: "/agents" },
          { label: "Agent Single", path: "/agent-single/1" },
          { label: "Agency", path: "/agency" },
          { label: "Agency Single", path: "/agency-single/1" },
        ],
      },

      {
        label: "Single Style",
        subMenu: [
          { label: "Single V1", path: "/single-v1/1" },
          { label: "Single V2", path: "/single-v2/1" },
          { label: "Single V3", path: "/single-v3/1" },
          { label: "Single V4", path: "/single-v4/1" },
          { label: "Single V5", path: "/single-v5/1" },
          { label: "Single V6", path: "/single-v6/1" },
          { label: "Single V7", path: "/single-v7/1" },
          { label: "Single V8", path: "/single-v8/1" },
          { label: "Single V9", path: "/single-v9/1" },
          { label: "Single V10", path: "/single-v10/1" },
        ],
      },
    ],
  },
  {
    label: "Dashboard",
    subMenu: [
      { label: "Dashboard Home", path: "/dashboard-home" },
      { label: "Message", path: "/dashboard-message" },
      { label: "New Property", path: "/dashboard-add-property" },
      { label: "My Properties", path: "/dashboard-my-properties" },
      { label: "My Favorites", path: "/dashboard-my-favourites" },
      { label: "Saved Search", path: "/dashboard-saved-search" },
      { label: "Reviews", path: "/dashboard-reviews" },
      { label: "My Package", path: "/dashboard-my-package" },
      { label: "My Profile", path: "/dashboard-my-profile" },
    ],
  },

  {
    label: "Contact",
    path: "/contact",
  },
];
