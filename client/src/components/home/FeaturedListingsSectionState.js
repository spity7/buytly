import Link from "next/link";

const SKELETON_CARD_COUNT = 4;

export function FeaturedListingsLoadingState() {
  return (
    <div
      className="featured-listings-skeleton row g-3 g-lg-4"
      aria-busy="true"
      aria-label="Loading featured listings"
    >
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <div
          key={index}
          className={`col-12 col-md-6 col-lg-3 featured-listings-skeleton__col${
            index >= 2
              ? " d-none d-lg-block"
              : index === 1
                ? " d-none d-md-block"
                : ""
          }`}
        >
          <div className="featured-listings-skeleton__card bdr1 bdrs12">
            <div className="featured-listings-skeleton__image" />
            <div className="featured-listings-skeleton__body">
              <div className="featured-listings-skeleton__line featured-listings-skeleton__line--title" />
              <div className="featured-listings-skeleton__line featured-listings-skeleton__line--text" />
              <div className="featured-listings-skeleton__meta">
                <div className="featured-listings-skeleton__line featured-listings-skeleton__line--xs" />
                <div className="featured-listings-skeleton__line featured-listings-skeleton__line--xs" />
                <div className="featured-listings-skeleton__line featured-listings-skeleton__line--xs" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <span className="visually-hidden">Loading featured listings…</span>
    </div>
  );
}

export function FeaturedListingsEmptyState() {
  return (
    <div className="featured-listings-empty bdr1 bdrs12" role="status">
      <div className="featured-listings-empty__icon" aria-hidden="true">
        <span className="flaticon-home-1" />
      </div>
      <h3 className="featured-listings-empty__title">
        No featured listings yet
      </h3>
      <p className="featured-listings-empty__text">
        Standout homes will appear here as they gain traction. In the meantime,
        explore everything we have on the market.
      </p>
      <div className="featured-listings-empty__actions">
        <Link href="/listings" className="ud-btn btn-thm">
          Browse all properties
          <i className="fal fa-arrow-right-long" />
        </Link>
        <Link href="/listings?view=projects" className="ud-btn2">
          View projects
          <i className="fal fa-arrow-right-long" />
        </Link>
      </div>
    </div>
  );
}
