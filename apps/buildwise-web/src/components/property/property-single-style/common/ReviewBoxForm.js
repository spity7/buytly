"use client";

import { openAuthModal } from "@/components/common/login-signup-modal/authModal";
import {
  useCreatePropertyReview,
  usePropertyReviewStatus,
} from "@/hooks/usePropertyReviews";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuthSafe } from "@/providers/AuthProvider";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { useState } from "react";
import { PROPERTY_LEAVE_REVIEW_SECTION_ID } from "@/components/property/property-single-style/common/reviews";
import { ReviewStarRatingInput } from "@/components/property/property-single-style/common/reviews/ReviewStarRating";

const ReviewBoxForm = () => {
  const { id } = usePropertySingle();
  const auth = useAuthSafe();
  const isAuthenticated = Boolean(auth?.user);
  const { data: hasReviewed = false, isLoading: isChecking } =
    usePropertyReviewStatus(id);
  const createReview = useCreatePropertyReview(id);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  if (isChecking) return null;
  if (hasReviewed) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      openAuthModal("signin");
      return;
    }

    try {
      await createReview.mutateAsync({
        rating,
        title: title.trim(),
        text: text.trim(),
      });
      notifySuccess("Review submitted");
      setTitle("");
      setText("");
      setRating(5);
    } catch (error) {
      notifyError(getApiError(error));
    }
  };

  return (
    <form
      id={PROPERTY_LEAVE_REVIEW_SECTION_ID}
      className="comments_form mt30"
      onSubmit={handleSubmit}
    >
      <div className="row">
        <div className="col-md-12">
          <div className="mb20">
            <label
              className="heading-color ff-heading fw600 mb10 d-block"
              id="property-review-rating-label"
            >
              Rating
            </label>
            <ReviewStarRatingInput
              value={rating}
              onChange={setRating}
              disabled={createReview.isPending}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Review
            </label>
            <textarea
              className="form-control"
              cols={30}
              rows={4}
              placeholder="Write a review"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={2000}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="btn-area">
            <button
              type="submit"
              className="ud-btn btn-thm"
              disabled={createReview.isPending}
            >
              Submit Review
              <i className="fal fa-arrow-right-long" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ReviewBoxForm;
