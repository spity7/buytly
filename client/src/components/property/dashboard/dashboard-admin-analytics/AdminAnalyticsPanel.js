"use client";

import Link from "next/link";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

export default function AdminAnalyticsPanel() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) {
    return <p className="text mb0">Loading analytics...</p>;
  }

  if (isError || !data) {
    return <p className="text-danger mb0">Failed to load analytics.</p>;
  }

  const usersByRole = data.usersByRole || [];
  const listingsByType = data.listingsByType || [];
  const topCities = data.topCities || [];
  const transactionVolume = data.transactionVolume || [];

  return (
    <div className="row">
      <div className="col-lg-4 mb30">
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 h-100">
          <h4 className="title fz17 mb20">Users by Role</h4>
          <ul className="list-unstyled mb-0">
            {usersByRole.map((row) => (
              <li
                key={row._id || "unknown"}
                className="d-flex justify-content-between mb10"
              >
                <span className="text-capitalize">{row._id || "unknown"}</span>
                <span className="fw600">{row.count || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col-lg-4 mb30">
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 h-100">
          <h4 className="title fz17 mb20">Bookings This Month</h4>
          <p className="title mb0">{data.bookingsThisMonth || 0}</p>
          <Link href="/dashboard-bookings" className="ud-btn btn-white2 mt20">
            View bookings
          </Link>
        </div>
      </div>

      <div className="col-lg-4 mb30">
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 h-100">
          <h4 className="title fz17 mb20">Completed Transactions</h4>
          <ul className="list-unstyled mb-0">
            {transactionVolume.length ? (
              transactionVolume.map((row) => (
                <li
                  key={row._id || "unknown"}
                  className="d-flex justify-content-between mb10"
                >
                  <span className="text-capitalize">{row._id || "other"}</span>
                  <span className="fw600">
                    {row.count || 0} · $
                    {(row.totalAmount || 0).toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text">No completed transactions yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="col-lg-6 mb30">
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 h-100">
          <h4 className="title fz17 mb20">Listings by Type & Status</h4>
          <ul className="list-unstyled mb-0">
            {listingsByType.map((row, index) => (
              <li
                key={`${row._id?.type}-${row._id?.status}-${index}`}
                className="d-flex justify-content-between mb10"
              >
                <span>
                  {(row._id?.type || "unknown").toString()} ·{" "}
                  {(row._id?.status || "unknown").toString()}
                </span>
                <span className="fw600">{row.count || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col-lg-6 mb30">
        <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 h-100">
          <h4 className="title fz17 mb20">Top Cities</h4>
          <ul className="list-unstyled mb-0">
            {topCities.length ? (
              topCities.map((city) => (
                <li
                  key={city._id || "unknown"}
                  className="d-flex justify-content-between mb10"
                >
                  <span>{city._id || "Unknown"}</span>
                  <span className="fw600">{city.count || 0}</span>
                </li>
              ))
            ) : (
              <li className="text">No active listings by city yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
