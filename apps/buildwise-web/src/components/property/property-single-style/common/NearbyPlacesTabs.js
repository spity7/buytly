"use client";

import { useId } from "react";

export default function NearbyPlacesTabs({
  categories = [],
  isLoading = false,
  isError = false,
  unavailable = false,
  emptyMessage = "No nearby places were found within 5 km.",
  missingCoordinatesMessage = "Location coordinates are not available for this listing.",
  hasCoordinates = true,
}) {
  const tabId = useId().replace(/:/g, "");

  if (!hasCoordinates) {
    return <p className="text mb-0 col-12">{missingCoordinatesMessage}</p>;
  }

  if (isLoading) {
    return <p className="text mb-0 col-12">Loading nearby places...</p>;
  }

  if (isError || unavailable) {
    return (
      <p className="text mb-0 col-12">
        Nearby places are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const visibleCategories = categories.filter(
    (category) => category.places?.length,
  );

  if (!visibleCategories.length) {
    return <p className="text mb-0 col-12">{emptyMessage}</p>;
  }

  return (
    <div className="col-md-12">
      <div className="navtab-style1">
        <nav>
          <div
            className="nav nav-tabs mb20"
            id={`nav-tab-${tabId}`}
            role="tablist"
          >
            {visibleCategories.map((tab, index) => (
              <button
                key={tab.title}
                className={`nav-link fw600 ${index === 0 ? "active" : ""}`}
                id={`nav-${tabId}-${index}-tab`}
                data-bs-toggle="tab"
                data-bs-target={`#nav-${tabId}-${index}`}
                type="button"
                role="tab"
                aria-controls={`nav-${tabId}-${index}`}
                aria-selected={index === 0 ? "true" : "false"}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="tab-content" id={`nav-tabContent-${tabId}`}>
          {visibleCategories.map((tab, index) => (
            <div
              key={tab.title}
              className={`tab-pane fade fz15 ${
                index === 0 ? "active show" : ""
              }`}
              id={`nav-${tabId}-${index}`}
              role="tabpanel"
              aria-labelledby={`nav-${tabId}-${index}-tab`}
            >
              {tab.places.map((place, detailIndex) => (
                <div
                  key={`${place.name}-${detailIndex}`}
                  className="nearby d-sm-flex align-items-center mb20"
                >
                  <div className="rating dark-color mr15 ms-1 mt10-xs mb10-xs">
                    <span className="fw600 fz14">{place.distanceLabel}</span>
                  </div>
                  <div className="details">
                    <p className="dark-color fw600 mb-0">{place.name}</p>
                    {place.subtitle ? (
                      <p className="text mb-0">{place.subtitle}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
