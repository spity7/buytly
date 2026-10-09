"use client";

import { openAuthModal } from "@/components/common/login-signup-modal/authModal";
import { buytlyApi } from "@/api/generated";
import { isPropertyBookable } from "@/lib/properties/mapProperty";
import { notifyError } from "@/lib/toast";
import { useAuthSafe } from "@/providers/AuthProvider";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export default function StartTransaction() {
  const { id, property, card } = usePropertySingle();
  const auth = useAuthSafe();
  const { run, isBusy: isSubmitting } = useAsyncAction();

  if (!isPropertyBookable(property?.status)) return null;

  const handleStart = async () => {
    if (!auth?.user) {
      openAuthModal("signin");
      return;
    }

    if (auth.user.role !== "buyer") {
      notifyError("Only buyers can initiate a transaction.");
      return;
    }

    try {
      await run({
        message: "Submitting offer...",
        successMessage: "Transaction request submitted",
        task: () =>
          buytlyApi.createTransaction({
            propertyId: id,
            type: "buy",
            amount: property.price,
            currency: property.currency,
          }),
      });
    } catch {
      // Toast handled by run()
    }
  };

  return (
    <div className="default-box-shadow1 bdrs12 bdr1 p30 mb30 bgc-white">
      <h4 className="form-title mb5">
        Make an offer
      </h4>
      <p className="text mb20">
        Initiate a purchase transaction for{" "}
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
