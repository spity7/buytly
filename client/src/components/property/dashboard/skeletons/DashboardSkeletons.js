"use client";

const DashboardBlock = ({ className = "" }) => (
  <div className={`dashboard-skeleton__block ${className}`.trim()} />
);

export const DashboardTitleSkeleton = () => (
  <div className="dashboard-skeleton__title-area" aria-hidden="true">
    <DashboardBlock className="dashboard-skeleton__title" />
    <DashboardBlock className="dashboard-skeleton__subtitle" />
  </div>
);

export const DashboardTableSkeleton = ({
  rows = 5,
  columns = 5,
  withThumbnail = true,
}) => {
  const gridTemplateColumns = withThumbnail
    ? `minmax(220px, 2fr) repeat(${Math.max(columns - 1, 1)}, minmax(70px, 1fr))`
    : `repeat(${columns}, minmax(90px, 1fr))`;
  const gridStyle = { gridTemplateColumns };

  return (
    <div className="dashboard-skeleton__table" aria-hidden="true">
      <div className="dashboard-skeleton__table-head" style={gridStyle}>
        {Array.from({ length: columns }).map((_, index) => (
          <DashboardBlock
            key={`head-${index}`}
            className="dashboard-skeleton__table-head-cell"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          className="dashboard-skeleton__table-row"
          key={`row-${rowIndex}`}
          style={gridStyle}
        >
          {withThumbnail ? (
            <div className="dashboard-skeleton__table-listing">
              <DashboardBlock className="dashboard-skeleton__table-thumb" />
              <div className="dashboard-skeleton__table-listing-text">
                <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--md" />
                <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
                <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--xs" />
              </div>
            </div>
          ) : null}
          {Array.from({
            length: withThumbnail ? columns - 1 : columns,
          }).map((_, cellIndex) => (
            <DashboardBlock
              key={`cell-${rowIndex}-${cellIndex}`}
              className={
                withThumbnail
                  ? "dashboard-skeleton__table-cell"
                  : "dashboard-skeleton__line dashboard-skeleton__line--lg"
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const DashboardGridSkeleton = ({ count = 4 }) => (
  <div className="row" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <div className="col-md-6 col-lg-4 col-xl-3" key={index}>
        <div className="dashboard-skeleton__card">
          <DashboardBlock className="dashboard-skeleton__card-image" />
          <div className="dashboard-skeleton__card-body">
            <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--md" />
            <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
            <div className="dashboard-skeleton__card-meta">
              <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--xs" />
              <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--xs" />
              <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--xs" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const DashboardFormSkeleton = ({ rows = 8 }) => (
  <div className="dashboard-skeleton__form p30" aria-hidden="true">
    <div className="row">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className={index === 1 ? "col-sm-12" : "col-sm-6 col-xl-4"}
          key={index}
        >
          <div className="dashboard-skeleton__field mb20">
            <DashboardBlock className="dashboard-skeleton__label" />
            <DashboardBlock className="dashboard-skeleton__input" />
          </div>
        </div>
      ))}
    </div>
    <DashboardBlock className="dashboard-skeleton__button" />
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="row" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div className="col-sm-6 col-xxl-3" key={index}>
        <div className="dashboard-skeleton__stat">
          <div className="dashboard-skeleton__stat-text">
            <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
            <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--md" />
          </div>
          <DashboardBlock className="dashboard-skeleton__stat-icon" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardWidgetSkeleton = ({ children }) => (
  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
    {children}
  </div>
);

export const DashboardPageSkeleton = () => (
  <>
    <div className="row pb40">
      <div className="col-lg-12">
        <DashboardBlock className="dashboard-skeleton__mobile-nav" />
      </div>
      <div className="col-lg-12">
        <DashboardTitleSkeleton />
      </div>
    </div>

    <div className="row pb40">
      <DashboardStatsSkeleton />
    </div>

    <div className="row">
      <div className="col-xl-8">
        <DashboardWidgetSkeleton>
          <DashboardBlock className="dashboard-skeleton__chart" />
        </DashboardWidgetSkeleton>
      </div>
      <div className="col-xl-4">
        <DashboardWidgetSkeleton>
          <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--md mb20" />
          {Array.from({ length: 4 }).map((_, index) => (
            <DashboardBlock
              key={index}
              className="dashboard-skeleton__line dashboard-skeleton__line--sm mb15"
            />
          ))}
        </DashboardWidgetSkeleton>
      </div>
    </div>
  </>
);

export const DashboardListingPageSkeleton = ({ variant = "table" }) => (
  <>
    <div className="row pb40 d-block d-lg-none">
      <div className="col-lg-12">
        <DashboardBlock className="dashboard-skeleton__mobile-nav" />
      </div>
    </div>

    <div className="row align-items-center pb40">
      <div className={variant === "table" ? "col-xxl-3" : "col-lg-12"}>
        <DashboardTitleSkeleton />
      </div>
      {variant === "table" ? (
        <div className="col-xxl-9">
          <div className="dashboard-skeleton__filter-row">
            <DashboardBlock className="dashboard-skeleton__filter" />
            <DashboardBlock className="dashboard-skeleton__filter dashboard-skeleton__filter--btn" />
          </div>
        </div>
      ) : null}
    </div>

    <div className="row">
      <div className="col-xl-12">
        <DashboardWidgetSkeleton>
          {variant === "form" ? (
            <DashboardFormSkeleton rows={10} />
          ) : (
            <div className="packages_table table-responsive">
              <DashboardTableSkeleton rows={5} columns={5} withThumbnail />
            </div>
          )}
        </DashboardWidgetSkeleton>
      </div>
    </div>
  </>
);

export const DashboardInlineStatsSkeleton = () => (
  <ul className="dashboard-skeleton__inline-stats mb0" aria-hidden="true">
    {Array.from({ length: 3 }).map((_, index) => (
      <li key={index}>
        <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--xs" />
        <DashboardBlock className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
      </li>
    ))}
  </ul>
);
