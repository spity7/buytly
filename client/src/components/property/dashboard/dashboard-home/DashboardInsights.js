"use client";

import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useMyProperties } from "@/hooks/useMyProperties";
import { canManageListings } from "@/lib/auth/roles";
import Link from "next/link";

export default function DashboardInsights({ role }) {
  const isAdmin = role === "admin";
  const canManage = canManageListings(role) && !isAdmin;

  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics({
    enabled: isAdmin,
  });
  const { data: myProperties, isLoading: propertiesLoading } = useMyProperties(
    { page: 1, limit: 5, sortBy: "viewCount", sortOrder: "desc" },
    { enabled: canManage },
  );

  if (isAdmin) {
    if (analyticsLoading) {
      return <p className="text mb0">Loading platform insights...</p>;
    }

    const topCities = analytics?.topCities || [];
    const transactionVolume = analytics?.transactionVolume || [];

    return (
      <div className="col-md-12">
        <h4 className="title fz17 mb20">Platform Overview</h4>
        <div className="row">
          <div className="col-md-6">
            <h5 className="fz15 mb15">Top Cities</h5>
            {topCities.length ? (
              <ul className="list-unstyled mb-0">
                {topCities.slice(0, 6).map((city) => (
                  <li
                    key={city._id || "unknown"}
                    className="d-flex justify-content-between mb10"
                  >
                    <span>{city._id || "Unknown"}</span>
                    <span className="fw600">{city.count || 0}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text mb0">No active listings by city yet.</p>
            )}
          </div>
          <div className="col-md-6">
            <h5 className="fz15 mb15">Completed Transactions</h5>
            {transactionVolume.length ? (
              <ul className="list-unstyled mb-0">
                {transactionVolume.map((row) => (
                  <li
                    key={row._id || "unknown"}
                    className="d-flex justify-content-between mb10"
                  >
                    <span className="text-capitalize">
                      {row._id || "other"}
                    </span>
                    <span className="fw600">
                      {row.count || 0} · $
                      {(row.totalAmount || 0).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text mb0">No completed transactions yet.</p>
            )}
          </div>
        </div>
        <div className="mt20">
          <Link href="/dashboard-admin-analytics" className="ud-btn btn-white2">
            View full analytics
          </Link>
        </div>
      </div>
    );
  }

  if (canManage) {
    if (propertiesLoading) {
      return <p className="text mb0">Loading your listings...</p>;
    }

    const properties = myProperties?.properties || [];

    return (
      <div className="col-md-12">
        <h4 className="title fz17 mb20">Your Top Listings</h4>
        {properties.length ? (
          <ul className="list-unstyled mb-0">
            {properties.map((property) => (
              <li
                key={property._id || property.id}
                className="d-flex justify-content-between align-items-center mb15"
              >
                <Link
                  href={`/dashboard-edit-property/${property._id || property.id}`}
                  className="text-decoration-none"
                >
                  {property.title}
                </Link>
                <span className="text-muted">
                  {property.viewCount || 0} views
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text mb0">
            You have no listings yet.{" "}
            <Link href="/dashboard-add-property">Add your first property</Link>.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="col-md-12">
      <h4 className="title fz17 mb20">Quick Links</h4>
      <div className="d-flex flex-wrap gap-2">
        <Link href="/listings" className="ud-btn btn-white2">
          Browse listings
        </Link>
        <Link href="/dashboard-my-favourites" className="ud-btn btn-white2">
          My favorites
        </Link>
        <Link href="/dashboard-saved-search" className="ud-btn btn-white2">
          Saved searches
        </Link>
      </div>
    </div>
  );
}
