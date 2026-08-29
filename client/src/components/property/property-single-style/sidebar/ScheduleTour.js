"use client";

import { useState } from "react";
import { openAuthModal } from "@/components/common/login-signup-modal/authModal";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuthSafe } from "@/providers/AuthProvider";
import PropertyStatusBanner from "@/components/property/property-single-style/common/PropertyStatusBanner";
import { isPropertyBookable } from "@/lib/properties/mapProperty";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

const ScheduleTour = () => {
  const { id, property } = usePropertySingle();
  const auth = useAuthSafe();
  const isAuthenticated = Boolean(auth?.user);
  const canBook = isPropertyBookable(property?.status);

  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      openAuthModal("signin");
      return;
    }

    if (!scheduledAt) {
      notifyError("Please choose a date and time for your tour.");
      return;
    }

    setIsSubmitting(true);
    try {
      await buytlyApi.createBooking({
        propertyId: id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        message: message.trim() || undefined,
      });
      notifySuccess("Tour request submitted");
      setScheduledAt("");
      setMessage("");
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canBook) {
    return (
      <p className="text mb-0">
        Tour scheduling is not available for this listing.
      </p>
    );
  }

  return (
    <div className="ps-navtab">
      <form className="form-style1" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="mb20">
              <input
                type="datetime-local"
                className="form-control"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="mb10">
              <textarea
                cols={30}
                rows={4}
                className="form-control"
                placeholder="Enter your message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="d-grid">
              <button
                type="submit"
                className="ud-btn btn-thm"
                disabled={isSubmitting}
              >
                Submit a Tour Request
                <i className="fal fa-arrow-right-long" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScheduleTour;
