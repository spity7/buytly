"use client";

import { useRouter } from "next/navigation";
import {
  getPropertyFormActionButtons,
  getPropertyFormActionConfig,
  getPropertyFormCancelHref,
} from "@/lib/properties/propertyFormActions";

export default function PropertyFormActions({
  isEdit,
  propertyStatus,
  hasChanges,
  formBusy,
  activeSubmitMode,
  isAdmin = false,
  onSubmitMode,
}) {
  const router = useRouter();
  const config = getPropertyFormActionConfig({
    isEdit,
    propertyStatus,
    hasChanges,
    formBusy,
    isAdmin,
  });

  const cancelHref = getPropertyFormCancelHref(isAdmin);

  if (config.isTerminal) {
    return (
      <div className="property-form-actions">
        <button
          type="button"
          className="property-form-actions__btn property-form-actions__btn--cancel ud-btn"
          disabled={formBusy}
          onClick={() => router.push(cancelHref)}
        >
          Back to listings
        </button>
      </div>
    );
  }

  const buttons = getPropertyFormActionButtons(config, {
    isEdit,
    activeSubmitMode,
  });

  const hasModerationActions = buttons.some(
    (button) =>
      (button.id === "review" || button.id === "draft") && !button.disabled,
  );
  const showSaveHint = !hasChanges && !formBusy && !hasModerationActions;

  return (
    <div className="property-form-actions">
      {isAdmin && isEdit ? (
        <span className="property-form-actions__badge">Admin mode</span>
      ) : null}
      {buttons.map((button) => (
        <button
          key={button.id}
          type={button.type}
          className={`property-form-actions__btn property-form-actions__btn--${button.variant} ud-btn${
            button.showArrow ? " property-form-actions__btn--with-icon" : ""
          }`}
          disabled={button.disabled}
          title={button.title}
          aria-disabled={button.disabled}
          onClick={
            button.type === "button"
              ? () => router.push(cancelHref)
              : () => onSubmitMode(button.submitMode)
          }
        >
          {button.label}
          {button.showArrow ? (
            <i className="fal fa-arrow-right-long" aria-hidden="true" />
          ) : null}
        </button>
      ))}
      {showSaveHint ? (
        <p className="property-form-actions__hint mb0">
          Edit the form to enable save actions.
        </p>
      ) : null}
    </div>
  );
}
