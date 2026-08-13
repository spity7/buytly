"use client";

const SkeletonBlock = ({ className = "", style }) => (
  <div
    className={`property-single-skeleton__block ${className}`.trim()}
    style={style}
  />
);

const PropertySingleWidgetSkeleton = ({ titleWidth = "30%", children }) => (
  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
    <SkeletonBlock
      className="property-single-skeleton__widget-title mb30"
      style={{ width: titleWidth }}
    />
    {children}
  </div>
);

const PropertySingleSkeleton = () => (
  <section className="pt60 pb90 bgc-f7" aria-hidden="true">
    <div className="container">
      <div className="row">
        <div className="col-lg-8">
          <div className="single-property-content mb30-md">
            <SkeletonBlock className="property-single-skeleton__page-title mb20" />
            <div className="property-single-skeleton__meta-row mb15">
              <SkeletonBlock className="property-single-skeleton__meta" />
              <SkeletonBlock className="property-single-skeleton__meta property-single-skeleton__meta--sm" />
              <SkeletonBlock className="property-single-skeleton__meta property-single-skeleton__meta--xs" />
            </div>
            <div className="property-single-skeleton__meta-row">
              <SkeletonBlock className="property-single-skeleton__meta property-single-skeleton__meta--pill" />
              <SkeletonBlock className="property-single-skeleton__meta property-single-skeleton__meta--pill" />
              <SkeletonBlock className="property-single-skeleton__meta property-single-skeleton__meta--pill" />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="single-property-content text-lg-end">
            <div className="property-single-skeleton__actions mb20">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className="property-single-skeleton__action-icon"
                />
              ))}
            </div>
            <SkeletonBlock className="property-single-skeleton__price mb10" />
            <SkeletonBlock className="property-single-skeleton__price-sub" />
          </div>
        </div>
      </div>

      <div className="row mb30 mt30">
        <div className="col-sm-6">
          <SkeletonBlock className="property-single-skeleton__gallery-main" />
        </div>
        <div className="col-sm-6">
          <div className="row">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="col-6 ps-sm-0" key={index}>
                <SkeletonBlock className="property-single-skeleton__gallery-thumb" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row wrap">
        <div className="col-lg-8">
          <PropertySingleWidgetSkeleton titleWidth="120px">
            <div className="row">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="col-sm-6 col-lg-4 mb25" key={index}>
                  <div className="property-single-skeleton__overview-item">
                    <SkeletonBlock className="property-single-skeleton__overview-icon" />
                    <div className="property-single-skeleton__overview-text">
                      <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--xs" />
                      <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PropertySingleWidgetSkeleton>

          <PropertySingleWidgetSkeleton titleWidth="180px">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="property-single-skeleton__line property-single-skeleton__line--full mb15"
              />
            ))}
            <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--md mt30 mb30" />
            <div className="row">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="col-sm-6 col-lg-4 mb20" key={index}>
                  <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--xs mb10" />
                  <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--sm" />
                </div>
              ))}
            </div>
          </PropertySingleWidgetSkeleton>

          <PropertySingleWidgetSkeleton titleWidth="100px">
            <SkeletonBlock className="property-single-skeleton__map mb20" />
            <div className="row">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="col-sm-6 mb15" key={index}>
                  <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--xs mb10" />
                  <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--md" />
                </div>
              ))}
            </div>
          </PropertySingleWidgetSkeleton>

          <PropertySingleWidgetSkeleton titleWidth="200px">
            <div className="row">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="col-sm-6 col-lg-3 mb15" key={index}>
                  <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--md" />
                </div>
              ))}
            </div>
          </PropertySingleWidgetSkeleton>
        </div>

        <div className="col-lg-4">
          <div className="default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white">
            <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--md mb10" />
            <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--sm mb20" />
            <SkeletonBlock className="property-single-skeleton__input mb15" />
            <SkeletonBlock className="property-single-skeleton__input mb15" />
            <SkeletonBlock className="property-single-skeleton__button" />
          </div>

          <div className="agen-personal-info bgc-white default-box-shadow1 bdrs12 p30 mt30">
            <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--md mb20" />
            <div className="property-single-skeleton__agent mb20">
              <SkeletonBlock className="property-single-skeleton__agent-avatar" />
              <div className="property-single-skeleton__agent-text">
                <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--sm mb10" />
                <SkeletonBlock className="property-single-skeleton__line property-single-skeleton__line--xs" />
              </div>
            </div>
            <SkeletonBlock className="property-single-skeleton__input mb15" />
            <SkeletonBlock className="property-single-skeleton__input mb15" />
            <SkeletonBlock className="property-single-skeleton__button" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PropertySingleSkeleton;
