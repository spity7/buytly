export function getProjectsTableEmptyState({
  isTrash,
  hasActiveFilters,
  onClearFilters,
  onShowActiveProjects,
}) {
  if (isTrash && hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No trashed projects match",
      description:
        "Try a different search or project type, or clear filters to see everything in trash.",
      actions: onClearFilters
        ? [{ label: "Clear filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  if (isTrash) {
    return {
      icon: "flaticon-bin",
      title: "Trash is empty",
      description:
        "Projects you move to trash appear here. You can restore them or delete them permanently.",
      actions: onShowActiveProjects
        ? [
            {
              label: "Back to my projects",
              variant: "thm",
              onClick: onShowActiveProjects,
            },
          ]
        : [],
    };
  }

  if (hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No projects match your filters",
      description:
        "Adjust search, status, type, or sort — or clear filters to see all active projects.",
      actions: onClearFilters
        ? [{ label: "Clear filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  return {
    icon: "flaticon-home",
    title: "No projects yet",
    description:
      "Create a development first, then add one or more sellable units on the project page.",
    actions: [
      { label: "Add project", variant: "thm", href: "/dashboard-add-project" },
      {
        label: "Browse all units",
        variant: "white2",
        href: "/dashboard-my-properties",
      },
    ],
  };
}

export function getPropertiesTableEmptyState({
  isTrash,
  hasActiveFilters,
  onClearFilters,
  onShowActiveListings,
}) {
  if (isTrash && hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No trashed units match",
      description:
        "Try another search or property type, or clear filters to browse all trashed units.",
      actions: onClearFilters
        ? [{ label: "Clear filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  if (isTrash) {
    return {
      icon: "flaticon-bin",
      title: "Trash is empty",
      description:
        "Units moved to trash are hidden from the public site. Units trashed with a project are managed from My Projects → Trash.",
      actions: onShowActiveListings
        ? [
            {
              label: "Back to my listings",
              variant: "thm",
              onClick: onShowActiveListings,
            },
            {
              label: "My projects",
              variant: "white2",
              href: "/dashboard-my-projects",
            },
          ]
        : [],
    };
  }

  if (hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No units match your filters",
      description:
        "Change search, status, type, or sort — or clear filters to see all active units.",
      actions: onClearFilters
        ? [{ label: "Clear filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  return {
    icon: "flaticon-home",
    title: "No units yet",
    description:
      "Units belong to a project. Open a project and add villas, apartments, or other sellable listings from there.",
    actions: [
      {
        label: "Go to my projects",
        variant: "thm",
        href: "/dashboard-my-projects",
      },
      {
        label: "Add project",
        variant: "white2",
        href: "/dashboard-add-project",
      },
    ],
  };
}

export function getAdminProjectsEmptyState({
  hasActiveFilters,
  isPendingQueue,
  onClearFilters,
}) {
  if (hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No projects match",
      description:
        "Try clearing filters or searching with a different title or owner email fragment.",
      actions: onClearFilters
        ? [{ label: "Reset filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  if (isPendingQueue) {
    return {
      icon: "flaticon-like",
      title: "No pending projects",
      description:
        "The moderation queue is clear. New submissions from sellers will appear here.",
      actions: [],
    };
  }

  return {
    icon: "flaticon-home",
    title: "No projects found",
    description: "There are no projects in the system for the current view.",
    actions: [],
  };
}

export function getAdminPropertiesEmptyState({
  hasActiveFilters,
  onClearFilters,
}) {
  if (hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No listings match",
      description:
        "Adjust status, type, search, or sort — or reset filters to browse all listings.",
      actions: onClearFilters
        ? [{ label: "Reset filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  return {
    icon: "flaticon-home",
    title: "No listings yet",
    description:
      "There are no property units in the system matching this view.",
    actions: [],
  };
}

export function getBookingsEmptyState({
  mode,
  hasActiveFilters,
  onClearFilters,
}) {
  if (hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No bookings match",
      description:
        "Try another status filter or clear filters to see all bookings.",
      actions: onClearFilters
        ? [{ label: "Clear filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  if (mode === "agent") {
    return {
      icon: "flaticon-calendar",
      title: "No visit requests yet",
      description:
        "When buyers schedule visits on your listings, incoming requests show up here for approval.",
      actions: [],
    };
  }

  return {
    icon: "flaticon-calendar",
    title: "No visits scheduled",
    description:
      "Browse listings and book a visit. Your requests and their status will appear here.",
    actions: [
      { label: "Browse listings", variant: "thm", href: "/grid-full-3-col" },
    ],
  };
}

export function getTransactionsEmptyState({
  hasActiveFilters,
  onClearFilters,
}) {
  if (hasActiveFilters) {
    return {
      icon: "flaticon-search",
      title: "No transactions match",
      description:
        "Change status or type filters, or clear them to see your full transaction history.",
      actions: onClearFilters
        ? [{ label: "Clear filters", variant: "thm", onClick: onClearFilters }]
        : [],
    };
  }

  return {
    icon: "flaticon-money-bag",
    title: "No transactions yet",
    description:
      "Purchase activity on your listings will appear here once buyers start deals.",
    actions: [],
  };
}

export function getSavedSearchesEmptyState() {
  return {
    icon: "flaticon-search",
    title: "No saved searches",
    description:
      "Save filters from the listings page to get back to the same search in one click.",
    actions: [
      { label: "Browse listings", variant: "thm", href: "/grid-full-3-col" },
    ],
  };
}
