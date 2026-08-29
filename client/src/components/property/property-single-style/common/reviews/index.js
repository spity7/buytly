"use client";

import { usePropertyReviews } from "@/hooks/usePropertyReviews";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import React from "react";
import SingleReview from "./SingleReview";

const sortOptions = ["Newest", "Highest rated", "Lowest rated"];

const AllReviews = () => {
  const { id } = usePropertySingle();
  const { data, isLoading } = usePropertyReviews(id);

  if (isLoading) {
    return <p className="text col-12">Loading reviews...</p>;
  }

  const reviews = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, reviewCount: 0 };

  if (!stats.reviewCount) {
    return (
      <div className="product_single_content mb50">
        <p className="text mb-0">No reviews yet. Be the first to review.</p>
      </div>
    );
  }

  return (
    <div className="product_single_content mb50">
      <div className="mbp_pagination_comments">
        <div className="row">
          <div className="col-lg-12">
            <div className="total_review d-flex align-items-center justify-content-between mb20">
              <h6 className="fz17 mb15">
                <i className="fas fa-star fz12 pe-2" />
                {stats.averageRating} · {stats.reviewCount} review
                {stats.reviewCount === 1 ? "" : "s"}
              </h6>
              <div className="page_control_shorting d-flex align-items-center justify-content-center justify-content-sm-end">
                <div className="pcs_dropdown mb15 d-flex align-items-center">
                  <span style={{ minWidth: "60px" }}>Sort by</span>
                  <select className="form-select" defaultValue={sortOptions[0]}>
                    {sortOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <SingleReview reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default AllReviews;
