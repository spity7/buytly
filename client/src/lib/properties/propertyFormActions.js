import { isPropertyTerminal } from "@/lib/properties/mapProperty";

export function getPropertyFormActionConfig({
  isEdit,
  propertyStatus,
  hasChanges,
  formBusy,
  isAdmin = false,
}) {
  const status = propertyStatus || "draft";
  const isTerminal = isPropertyTerminal(propertyStatus);

  if (isAdmin) {
    const canSaveChanges = isEdit;
    const showReturnDraft = status === "pending";
    const showSaveDraft =
      status === "draft" ||
      status === "active" ||
      status === "archived" ||
      status === "sold" ||
      status === "rented" ||
      !isEdit;
    const showSubmitReview =
      status === "draft" ||
      status === "pending" ||
      status === "archived" ||
      !isEdit;

    let primaryAction = "publish";
    if (
      isEdit &&
      (status === "active" || status === "sold" || status === "rented")
    ) {
      primaryAction = "save";
    }
    if (status === "pending") {
      primaryAction = "publish";
    }

    return {
      isTerminal: false,
      status,
      isAdmin: true,
      canSaveChanges,
      showSaveDraft: showSaveDraft && !showReturnDraft,
      showReturnDraft,
      showSubmitReview,
      primaryAction,
      contentActionsDisabled: formBusy || !hasChanges,
      moderationActionsDisabled: formBusy,
      formBusy,
      hasChanges,
    };
  }

  const canSaveChanges =
    isEdit && (status === "active" || status === "pending");
  const showSaveDraft =
    !isTerminal && (status === "draft" || status === "active" || !isEdit);
  const showSubmitReview = !isTerminal && status !== "pending";

  let primaryAction = "review";
  if (status === "active" || status === "pending") {
    primaryAction = "save";
  }

  const contentActionsDisabled = formBusy || !hasChanges;

  return {
    isTerminal,
    status,
    isAdmin: false,
    canSaveChanges,
    showSaveDraft,
    showReturnDraft: false,
    showSubmitReview,
    primaryAction,
    contentActionsDisabled,
    moderationActionsDisabled: contentActionsDisabled,
    formBusy,
    hasChanges,
  };
}

function getContentDisabledTitle(hasChanges, formBusy) {
  if (formBusy) return "Please wait...";
  if (!hasChanges) return "Make changes to enable this action";
  return undefined;
}

function getPublishLabel({
  isAdmin,
  status,
  isEdit,
  formBusy,
  activeSubmitMode,
}) {
  if (formBusy && activeSubmitMode === "review") {
    return isAdmin && status === "pending" ? "Approving..." : "Publishing...";
  }

  if (isAdmin) {
    if (status === "pending") return "Approve & publish";
    if (status === "archived") return "Restore & publish";
    return isEdit ? "Publish listing" : "Publish listing";
  }

  return isEdit ? "Submit for review" : "Publish listing";
}

export function getPropertyFormActionButtons(
  config,
  { isEdit, activeSubmitMode },
) {
  const {
    isAdmin,
    status,
    canSaveChanges,
    showSaveDraft,
    showReturnDraft,
    showSubmitReview,
    primaryAction,
    contentActionsDisabled,
    moderationActionsDisabled,
    formBusy,
    hasChanges,
  } = config;

  const contentDisabledTitle = getContentDisabledTitle(hasChanges, formBusy);
  const isModerationDraft = isAdmin && (showReturnDraft || showSaveDraft);
  const draftDisabled = isModerationDraft
    ? moderationActionsDisabled
    : contentActionsDisabled;
  const draftDisabledTitle = isModerationDraft
    ? formBusy
      ? "Please wait..."
      : undefined
    : contentDisabledTitle;
  const buttons = [];

  buttons.push({
    id: "cancel",
    type: "button",
    label: "Cancel",
    variant: "cancel",
    disabled: formBusy,
  });

  if (canSaveChanges) {
    buttons.push({
      id: "save",
      type: "submit",
      submitMode: "save",
      label:
        formBusy && activeSubmitMode === "save" ? "Saving..." : "Save changes",
      variant: primaryAction === "save" ? "primary" : "secondary",
      disabled: contentActionsDisabled,
      title: contentDisabledTitle,
    });
  }

  if (showReturnDraft) {
    buttons.push({
      id: "draft",
      type: "submit",
      submitMode: "draft",
      label:
        formBusy && activeSubmitMode === "draft"
          ? "Saving..."
          : "Return to draft",
      variant: "secondary",
      disabled: draftDisabled,
      title: draftDisabledTitle,
    });
  } else if (showSaveDraft) {
    buttons.push({
      id: "draft",
      type: "submit",
      submitMode: "draft",
      label:
        formBusy && activeSubmitMode === "draft"
          ? "Saving..."
          : isAdmin
            ? "Set as draft"
            : "Save as draft",
      variant: "secondary",
      disabled: draftDisabled,
      title: draftDisabledTitle,
    });
  }

  if (showSubmitReview) {
    const publishDisabled = isAdmin
      ? moderationActionsDisabled
      : contentActionsDisabled;

    buttons.push({
      id: "review",
      type: "submit",
      submitMode: "review",
      label: getPublishLabel({
        isAdmin,
        status,
        isEdit,
        formBusy,
        activeSubmitMode,
      }),
      variant: primaryAction === "publish" ? "primary" : "accent",
      disabled: publishDisabled,
      title: isAdmin
        ? formBusy
          ? "Please wait..."
          : undefined
        : contentDisabledTitle,
      showArrow: true,
    });
  }

  return buttons;
}

export function getPropertyFormCancelHref(isAdmin) {
  return isAdmin ? "/dashboard-admin-properties" : "/dashboard-my-properties";
}
