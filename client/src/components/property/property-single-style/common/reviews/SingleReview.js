"use client";

import { remoteImageProps } from "@/lib/images/remoteImage";
import Image from "next/image";
import React from "react";

const PLACEHOLDER_AVATAR = "/images/blog/comments-2.png";

function getReviewerName(user) {
  if (!user || typeof user === "string") return "Anonymous";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
}

function formatReviewDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SingleReview = ({ reviews = [] }) => {
  return (
    <>
      {reviews.map((review) => {
        const user = review.userId;
        const avatarUrl = user?.avatar?.url || PLACEHOLDER_AVATAR;

        return (
          <div className="col-md-12" key={review._id}>
            <div className="mbp_first position-relative d-flex align-items-center justify-content-start mt30 mb30-sm">
              <Image
                width={60}
                height={60}
                src={avatarUrl}
                className="mr-3"
                alt={getReviewerName(user)}
                {...remoteImageProps(avatarUrl)}
              />
              <div className="ml20">
                <h6 className="mt-0 mb-0">{getReviewerName(user)}</h6>
                <div>
                  <span className="fz14">
                    {formatReviewDate(review.createdAt)}
                  </span>
                  <div className="blog-single-review">
                    <ul className="mb0 ps-0">
                      {[...Array(review.rating || 0)].map((_, i) => (
                        <li className="list-inline-item me-0" key={i}>
                          <span>
                            <i className="fas fa-star review-color2 fz10" />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {review.title && (
              <h6 className="fz16 mb10 dark-color">{review.title}</h6>
            )}
            <p className="text mt20 mb20">{review.text}</p>
          </div>
        );
      })}
    </>
  );
};

export default SingleReview;
