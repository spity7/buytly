"use client";

import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useMyProperties } from "@/hooks/useMyProperties";
import { canManageListings } from "@/lib/auth/roles";
import { formatPrice } from "@/lib/properties/formatPrice";
import Link from "next/link";
import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

function formatPlaceLabel(value) {
  if (!value || value === "unknown") return "Unknown";
  return value
    .toString()
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatTransactionTypeLabel(type) {
  const key = (type || "other").toString().toLowerCase();
  const labels = {
    sale: "Property sales",
    rent: "Rentals",
    lease: "Leases",
    booking: "Booking fees",
    commission: "Commissions",
    other: "Other",
  };
  return labels[key] || formatPlaceLabel(key);
}

function InsightEmpty({ icon, title, description }) {
  return (
    <div className="dashboard-insight-empty" role="status">
      <span className={`dashboard-insight-empty__icon ${icon}`} aria-hidden />
      <div className="dashboard-insight-empty__body">
        <p className="dashboard-insight-empty__title mb0">{title}</p>
        {description ? (
          <p className="dashboard-insight-empty__text mb0">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function PlatformOverviewSkeleton() {
  return (
    <div className="dashboard-platform-overview placeholder-glow">
      <span className="placeholder col-4 mb20 d-block" />
      <span className="placeholder col-8 mb25 d-block" />
      <div className="row g-3 mb25">
        {[1, 2, 3].map((key) => (
          <div className="col-sm-4" key={key}>
            <span
              className="placeholder col-12 d-block bdrs8"
              style={{ height: 72 }}
            />
          </div>
        ))}
      </div>
      <div className="row g-4">
        <div className="col-md-6">
          <span className="placeholder col-5 mb15 d-block" />
          <span className="placeholder col-12 mb10 d-block" />
          <span className="placeholder col-12 mb10 d-block" />
          <span className="placeholder col-10 d-block" />
        </div>
        <div className="col-md-6">
          <span className="placeholder col-6 mb15 d-block" />
          <span className="placeholder col-12 mb10 d-block" />
          <span className="placeholder col-11 d-block" />
        </div>
      </div>
    </div>
  );
}

function AdminPlatformOverview({ analytics }) {
  const topCities = analytics?.topCities || [];
  const transactionVolume = analytics?.transactionVolume || [];

  const totalDeals = transactionVolume.reduce(
    (sum, row) => sum + (row.count || 0),
    0,
  );
  const grossVolume = transactionVolume.reduce(
    (sum, row) => sum + (row.totalAmount || 0),
    0,
  );
  const activeMarkets = topCities.length;
  const maxCityCount = topCities.reduce(
    (max, city) => Math.max(max, city.count || 0),
    0,
  );
  const cityListingTotal = topCities.reduce(
    (sum, city) => sum + (city.count || 0),
    0,
  );

  return (
    <div className="dashboard-platform-overview">
      <header className="dashboard-platform-overview__header mb25">
        <h4 className="title fz17 mb8">Platform Overview</h4>
        <p className="text mb0 fz14">
          Geographic demand and closed-deal performance across the marketplace.
        </p>
      </header>

      <div className="row g-3 mb30">
        <div className="col-sm-4">
          <div className="dashboard-insight-kpi">
            <span className="dashboard-insight-kpi__label">
              Completed deals
            </span>
            <span className="dashboard-insight-kpi__value">{totalDeals}</span>
            <span className="dashboard-insight-kpi__hint">All time</span>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="dashboard-insight-kpi">
            <span className="dashboard-insight-kpi__label">Gross volume</span>
            <span className="dashboard-insight-kpi__value">
              {formatPrice(grossVolume)}
            </span>
            <span className="dashboard-insight-kpi__hint">
              Settled transactions
            </span>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="dashboard-insight-kpi">
            <span className="dashboard-insight-kpi__label">Active markets</span>
            <span className="dashboard-insight-kpi__value">
              {activeMarkets}
            </span>
            <span className="dashboard-insight-kpi__hint">
              Cities with live listings
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <section className="dashboard-insight-panel h-100">
            <h5 className="dashboard-insight-panel__title">
              <span className="flaticon-location" aria-hidden />
              Top markets
            </h5>
            <p className="dashboard-insight-panel__subtitle">
              Cities with the most active listings on the platform.
            </p>
            {topCities.length ? (
              <ul className="dashboard-insight-list list-unstyled mb-0">
                {topCities.slice(0, 5).map((city, index) => {
                  const count = city.count || 0;
                  const share = cityListingTotal
                    ? Math.round((count / cityListingTotal) * 100)
                    : 0;
                  const barWidth = maxCityCount
                    ? Math.round((count / maxCityCount) * 100)
                    : 0;

                  return (
                    <li
                      key={city._id || `city-${index}`}
                      className="dashboard-insight-list__item"
                    >
                      <div className="dashboard-insight-list__row">
                        <span className="dashboard-insight-rank">
                          {index + 1}
                        </span>
                        <div className="dashboard-insight-list__main">
                          <div className="dashboard-insight-list__meta">
                            <span className="dashboard-insight-list__label">
                              {formatPlaceLabel(city._id)}
                            </span>
                            <span className="dashboard-insight-list__value">
                              {count}{" "}
                              <span className="text-muted fw-normal">
                                listing{count === 1 ? "" : "s"}
                              </span>
                            </span>
                          </div>
                          <div
                            className="dashboard-insight-bar"
                            role="presentation"
                          >
                            <span
                              className="dashboard-insight-bar__fill"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                        <span className="dashboard-insight-list__share">
                          {share}%
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <InsightEmpty
                icon="flaticon-home"
                title="No market data yet"
                description="Active listings will appear here once properties are published in specific cities."
              />
            )}
          </section>
        </div>

        <div className="col-md-6">
          <section className="dashboard-insight-panel h-100">
            <h5 className="dashboard-insight-panel__title">
              <span className="flaticon-search-chart" aria-hidden />
              Deal performance
            </h5>
            <p className="dashboard-insight-panel__subtitle">
              Completed transactions grouped by deal type.
            </p>
            {transactionVolume.length ? (
              <ul className="dashboard-insight-list list-unstyled mb-0">
                {transactionVolume.map((row, index) => (
                  <li
                    key={row._id || `txn-${index}`}
                    className="dashboard-insight-list__item dashboard-insight-list__item--compact"
                  >
                    <div className="dashboard-insight-list__row">
                      <div className="dashboard-insight-list__main">
                        <div className="dashboard-insight-list__meta">
                          <span className="dashboard-insight-list__label">
                            {formatTransactionTypeLabel(row._id)}
                          </span>
                          <span className="dashboard-insight-list__value">
                            {row.count || 0} deal
                            {(row.count || 0) === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                      <span className="dashboard-insight-list__amount">
                        {formatPrice(row.totalAmount || 0)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <InsightEmpty
                icon="flaticon-turn-back"
                title="No completed deals yet"
                description="Closed sales and rentals will be summarized here as transactions are marked complete."
              />
            )}
          </section>
        </div>
      </div>

      <div className="dashboard-platform-overview__footer d-grid gap-2 d-sm-flex mt30">
        <Link href="/dashboard-admin-analytics" className="ud-btn btn-thm">
          <DashboardBtnIcon icon={dashboardIcons.chart} />
          View full analytics
          <DashboardBtnIcon
            icon={dashboardIcons.arrowRight}
            position="trailArrow"
          />
        </Link>
        <Link href="/dashboard-transactions" className="ud-btn btn-white2">
          <DashboardBtnIcon icon={dashboardIcons.review} />
          Manage transactions
        </Link>
      </div>
    </div>
  );
}

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
      return (
        <div className="col-md-12">
          <PlatformOverviewSkeleton />
        </div>
      );
    }

    return (
      <div className="col-md-12">
        <AdminPlatformOverview analytics={analytics} />
      </div>
    );
  }

  if (canManage) {
    if (propertiesLoading) {
      return (
        <div className="col-md-12 placeholder-glow">
          <span className="placeholder col-5 mb20 d-block" />
          <span className="placeholder col-12 mb10 d-block" />
          <span className="placeholder col-11 d-block" />
        </div>
      );
    }

    const properties = myProperties?.properties || [];
    const maxViews = properties.reduce(
      (max, property) => Math.max(max, property.viewCount || 0),
      0,
    );

    return (
      <div className="col-md-12 dashboard-platform-overview">
        <header className="dashboard-platform-overview__header mb25">
          <h4 className="title fz17 mb8">Your top listings</h4>
          <p className="text mb0 fz14">
            Properties attracting the most buyer interest right now.
          </p>
        </header>
        {properties.length ? (
          <ul className="dashboard-insight-list list-unstyled mb-0">
            {properties.map((property, index) => {
              const views = property.viewCount || 0;
              const barWidth = maxViews
                ? Math.round((views / maxViews) * 100)
                : 0;

              return (
                <li
                  key={property._id || property.id}
                  className="dashboard-insight-list__item"
                >
                  <div className="dashboard-insight-list__row">
                    <span className="dashboard-insight-rank">{index + 1}</span>
                    <div className="dashboard-insight-list__main">
                      <div className="dashboard-insight-list__meta">
                        <Link
                          href={`/dashboard-edit-property/${property._id || property.id}`}
                          className="dashboard-insight-list__label dashboard-insight-list__link"
                        >
                          {property.title}
                        </Link>
                        <span className="dashboard-insight-list__value">
                          {views} view{views === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className="dashboard-insight-bar"
                        role="presentation"
                      >
                        <span
                          className="dashboard-insight-bar__fill"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <InsightEmpty
            icon="flaticon-home"
            title="No listings published"
            description="Add a property to start tracking views and engagement from your dashboard."
          />
        )}
        {!properties.length ? (
          <div className="mt25 d-grid">
            <Link href="/dashboard-add-property" className="ud-btn btn-thm">
              <DashboardBtnIcon icon={dashboardIcons.add} />
              Add your first property
              <DashboardBtnIcon
                icon={dashboardIcons.arrowRight}
                position="trailArrow"
              />
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="col-md-12 dashboard-platform-overview">
      <header className="dashboard-platform-overview__header mb25">
        <h4 className="title fz17 mb8">Quick links</h4>
        <p className="text mb0 fz14">
          Jump back into browsing, saved searches, and your shortlist.
        </p>
      </header>
      <div className="d-flex flex-wrap gap-2">
        <Link href="/listings" className="ud-btn btn-white2">
          <DashboardBtnIcon icon={dashboardIcons.browse} />
          Browse listings
        </Link>
        <Link href="/dashboard-my-favourites" className="ud-btn btn-white2">
          <DashboardBtnIcon icon={dashboardIcons.heart} />
          My favorites
        </Link>
        <Link href="/dashboard-saved-search" className="ud-btn btn-white2">
          <DashboardBtnIcon icon={dashboardIcons.search} />
          Saved searches
        </Link>
      </div>
    </div>
  );
}
