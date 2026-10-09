"use client";

import { remoteImageProps } from "@/lib/images/remoteImage";
import Image from "next/image";
import ReviewStarRating from "./ReviewStarRating";

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
  if (!reviews.length) return null;

  return (
    <ul className="property-reviews__list list-unstyled mb0">
      {reviews.map((review) => {
        const user = review.userId;
        const avatarUrl = user?.avatar?.url || PLACEHOLDER_AVATAR;
        const name = getReviewerName(user);

        return (
          <li className="property-review-card" key={review._id}>
            <div className="property-review-card__header">
              <div className="property-review-card__avatar">
                <Image
                  width={48}
                  height={48}
                  src={avatarUrl}
                  alt=""
                  aria-hidden
                  {...remoteImageProps(avatarUrl)}
                />
              </div>
              <div className="property-review-card__meta">
                <div className="property-review-card__meta-top">
                  <span className="property-review-card__name">{name}</span>
                  <ReviewStarRating value={review.rating} size="sm" />
                </div>
                <time
                  className="property-review-card__date"
                  dateTime={review.createdAt}
                >
                  {formatReviewDate(review.createdAt)}
                </time>
              </div>
            </div>

            {review.title ? (
              <p className="property-review-card__title">{review.title}</p>
            ) : null}
            {review.text ? (
              <p className="property-review-card__text">{review.text}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default SingleReview;
