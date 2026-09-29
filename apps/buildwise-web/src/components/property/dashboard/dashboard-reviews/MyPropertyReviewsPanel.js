"use client";

import ApiPagination from "@/components/property/ApiPagination";
import SingleReview from "@/components/property/property-single-style/common/reviews/SingleReview";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useMyPropertyReviews } from "@/hooks/useMyPropertyReviews";
import Link from "next/link";
import { useState } from "react";

function getPropertyLabel(review) {
  const property = review.propertyId;
  if (!property || typeof property === "string") return "Listing";
  return property.title || "Listing";
}

function getPropertyHref(review) {
  const property = review.propertyId;
  const id = typeof property === "string" ? property : property?._id;
  return id ? `/single-v1/${id}#property-reviews` : "/dashboard-my-properties";
}

const MyPropertyReviewsPanel = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, refetch } = useMyPropertyReviews({
    page,
    limit: pageSize,
  });

  const reviews = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, reviewCount: 0 };
  const pagination = data?.pagination;

  if (isLoading) {
    return <DashboardTableSkeleton rows={4} />;
  }

  if (isError) {
    return (
      <div className="alert alert-danger mb-0">
        Failed to load reviews.{" "}
        <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <p className="text mb-0">
        No reviews on your listings yet. Reviews appear here when buyers rate your
        active properties.
      </p>
    );
  }

  return (
    <div className="product_single_content mb0">
      <div className="mbp_pagination_comments">
        <div className="row">
          <div className="col-lg-12">
            <div className="total_review d-flex align-items-center justify-content-between mb20 mt20">
              <h6 className="fz17 mb0">
                <i className="fas fa-star fz12 pe-2" />
                {stats.averageRating} · {stats.reviewCount}{" "}
                {stats.reviewCount === 1 ? "review" : "reviews"}
              </h6>
            </div>
          </div>

          {reviews.map((review) => (
            <div className="col-md-12" key={review._id}>
              <div className="mb15 pb15 border-bottom">
                <p className="text mb10">
                  On{" "}
                  <Link href={getPropertyHref(review)} className="fw600">
                    {getPropertyLabel(review)}
                  </Link>
                </p>
                <SingleReview reviews={[review]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ApiPagination
        page={page}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        limit={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
};

export default MyPropertyReviewsPanel;
