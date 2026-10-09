"use client";

import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useAgentBookings, useMyBookings } from "@/hooks/useBookings";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useFavorites } from "@/hooks/useFavorites";
import { useMyProperties } from "@/hooks/useMyProperties";
import { canManageListings } from "@/lib/auth/roles";
import Link from "next/link";

function StatCard({ text, title, icon, href }) {
  const content = (
    <div className="d-flex justify-content-between statistics_funfact">
      <div className="details">
        <div className="text fz25">{text}</div>
        <div className="title">{title}</div>
      </div>
      <div className="icon text-center">
        <i className={icon} />
      </div>
    </div>
  );

  return (
    <div className="col-sm-6 col-xxl-3">
      {href ? (
        <Link href={href} className="d-block text-decoration-none">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function LoadingStats() {
  return [1, 2, 3, 4].map((key) => (
    <div className="col-sm-6 col-xxl-3" key={key}>
      <div className="statistics_funfact">
        <div className="placeholder-glow">
          <span className="placeholder col-8" />
        </div>
      </div>
    </div>
  ));
}

export default function DashboardTopStats({ role }) {
  const isAdmin = role === "admin";
  const canManage = canManageListings(role);

  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics({
    enabled: isAdmin,
  });
  const { data: myProperties, isLoading: propertiesLoading } = useMyProperties(
    { page: 1, limit: 1 },
    { enabled: canManage },
  );
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(
    { page: 1, limit: 1 },
    { enabled: Boolean(role) },
  );
  const { data: myBookings, isLoading: myBookingsLoading } = useMyBookings(
    { page: 1, limit: 1 },
    { enabled: role === "buyer" },
  );
  const { data: agentBookings, isLoading: agentBookingsLoading } =
    useAgentBookings(
      { page: 1, limit: 1 },
      { enabled: canManage && role !== "admin" },
    );
  const { data: unreadCount, isLoading: unreadLoading } =
    useUnreadNotificationCount({ enabled: Boolean(role) });

  const bookings = role === "buyer" ? myBookings : agentBookings;
  const bookingsLoading =
    role === "buyer" ? myBookingsLoading : agentBookingsLoading;

  const isLoading =
    (isAdmin && analyticsLoading) ||
    (canManage && propertiesLoading) ||
    favoritesLoading ||
    bookingsLoading ||
    unreadLoading;

  if (isLoading) {
    return <LoadingStats />;
  }

  if (isAdmin && analytics) {
    const totalUsers = (analytics.usersByRole || []).reduce(
      (sum, row) => sum + (row.count || 0),
      0,
    );
    const activeListings = (analytics.listingsByType || [])
      .filter((row) => row._id?.status === "active")
      .reduce((sum, row) => sum + (row.count || 0), 0);
    const pendingListings = (analytics.listingsByType || [])
      .filter((row) => row._id?.status === "pending")
      .reduce((sum, row) => sum + (row.count || 0), 0);

    return (
      <>
        <StatCard
          text="Platform Users"
          title={String(totalUsers)}
          icon="flaticon-user"
          href="/dashboard-admin-users"
        />
        <StatCard
          text="Active Listings"
          title={String(activeListings)}
          icon="flaticon-home"
          href="/dashboard-admin-properties"
        />
        <StatCard
          text="Pending Review"
          title={String(pendingListings)}
          icon="flaticon-search-chart"
          href="/dashboard-admin-properties"
        />
        <StatCard
          text="Bookings This Month"
          title={String(analytics.bookingsThisMonth || 0)}
          icon="flaticon-calendar"
          href="/dashboard-bookings"
        />
      </>
    );
  }

  const stats = [
    canManage
      ? {
          text: "My Properties",
          title: String(myProperties?.pagination?.total || 0),
          icon: "flaticon-home",
          href: "/dashboard-my-properties",
        }
      : null,
    {
      text: "My Favorites",
      title: String(favorites?.pagination?.total || 0),
      icon: "flaticon-like",
      href: "/dashboard-my-favourites",
    },
    {
      text: "My Bookings",
      title: String(bookings?.pagination?.total || 0),
      icon: "flaticon-calendar",
      href: "/dashboard-bookings",
    },
    {
      text: "Unread Alerts",
      title: String(unreadCount ?? 0),
      icon: "flaticon-bell",
      href: "/dashboard-notifications",
    },
  ].filter(Boolean);

  return (
    <>
      {stats.map((stat) => (
        <StatCard key={stat.text} {...stat} />
      ))}
    </>
  );
}
