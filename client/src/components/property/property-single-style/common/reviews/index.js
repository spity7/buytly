"use client";

import PropertySectionEmptyState, {
  PropertyReviewsEmptyDecoration,
} from "@/components/property/property-single-style/common/PropertySectionEmptyState";
import PsWidgetTitle from "@/components/property/property-single-style/common/PsWidgetTitle";
import {
  usePropertyReviewStatus,
  usePropertyReviews,
} from "@/hooks/usePropertyReviews";
import { isPropertyBookable } from "@/lib/properties/mapProperty";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { useMemo, useState } from "react";
import ReviewStarRating, { formatAverageRating } from "./ReviewStarRating";
import { REVIEW_SORT_OPTIONS, sortPropertyReviews } from "./reviewSort";
import SingleReview from "./SingleReview";

export const PROPERTY_LEAVE_REVIEW_SECTION_ID = "property-leave-review";

const AllReviews = () => {
  const { id, property } = usePropertySingle();
  const { data, isLoading } = usePropertyReviews(id);
  const { data: hasReviewed = false, isLoading: isReviewStatusLoading } =
    usePropertyReviewStatus(id);
  const [sortKey, setSortKey] = useState("newest");

  const reviews = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, reviewCount: 0 };
  const sortedReviews = useMemo(
    () => sortPropertyReviews(reviews, sortKey),
    [reviews, sortKey],
  );

  if (isLoading) {
    return (
      <div className="property-reviews col-12">
        <PsWidgetTitle
          icon="flaticon-review"
          className="property-reviews__title"
        >
          Reviews
        </PsWidgetTitle>
        <p className="property-reviews__loading text mb0">Loading reviews…</p>
      </div>
    );
  }

  if (!stats.reviewCount) {
    const canLeaveReview =
      isPropertyBookable(property?.status) &&
      !isReviewStatusLoading &&
      !hasReviewed;

    return (
      <div className="property-reviews col-12">
        <PsWidgetTitle
          icon="flaticon-review"
          className="property-reviews__title"
        >
          Reviews
        </PsWidgetTitle>
        <PropertySectionEmptyState
          variant="embedded"
          icon="flaticon-review"
          title="No reviews yet"
          description={
            canLeaveReview
              ? "Share your experience with this property to help other buyers and renters make confident decisions."
              : "This listing does not have any reviews yet. Check back later to see what others thought."
          }
          decoration={<PropertyReviewsEmptyDecoration />}
        />
      </div>
    );
  }

  const count = stats.reviewCount;
  const averageLabel = formatAverageRating(stats.averageRating);

  return (
    <div className="property-reviews col-12">
      <PsWidgetTitle icon="flaticon-review" className="property-reviews__title">
        Reviews
      </PsWidgetTitle>
      <div className="property-reviews__toolbar">
        <div className="property-reviews__summary">
          <ReviewStarRating value={stats.averageRating} size="lg" />
          <span className="property-reviews__score">
            <strong>{averageLabel}</strong>
            <span className="property-reviews__score-sep" aria-hidden>
              ·
            </span>
            <span>
              {count} review{count === 1 ? "" : "s"}
            </span>
          </span>
        </div>

        {count > 1 ? (
          <label className="property-reviews__sort">
            <span className="property-reviews__sort-label">Sort by</span>
            <select
              className="form-select property-reviews__sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              {REVIEW_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <SingleReview reviews={sortedReviews} />
    </div>
  );
};

export default AllReviews;
