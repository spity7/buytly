"use client";

import { openAuthModal } from "@/components/common/login-signup-modal/authModal";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { isPropertyBookable } from "@/lib/properties/mapProperty";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuthSafe } from "@/providers/AuthProvider";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { useState } from "react";

export default function StartTransaction() {
  const { id, property, card } = usePropertySingle();
  const auth = useAuthSafe();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPropertyBookable(property?.status)) return null;

  const txnType = property?.listingType === "rent" ? "rent" : "buy";

  const handleStart = async () => {
    if (!auth?.user) {
      openAuthModal("signin");
      return;
    }

    if (auth.user.role !== "buyer") {
      notifyError("Only buyers can initiate a transaction.");
      return;
    }

    setIsSubmitting(true);
    try {
      await buytlyApi.createTransaction({
        propertyId: id,
        type: txnType,
        amount: property.price,
        currency: property.currency,
      });
      notifySuccess("Transaction request submitted");
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="default-box-shadow1 bdrs12 bdr1 p30 mb30 bgc-white">
      <h4 className="form-title mb5">
        {txnType === "rent" ? "Start rental" : "Make an offer"}
      </h4>
      <p className="text mb20">
        Initiate a {txnType === "rent" ? "rental" : "purchase"} transaction for{" "}
        {card?.price || "this property"}.
      </p>
      <button
        type="button"
        className="ud-btn btn-thm w-100"
        onClick={handleStart}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Start transaction"}
      </button>
    </div>
  );
}
