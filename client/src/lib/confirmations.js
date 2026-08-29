export function propertyTrashConfirmation(title) {
  return {
    title: "Move listing to trash?",
    message: `"${title}" will be hidden from the public site. You can restore it from the Trash tab.`,
    confirmLabel: "Move to trash",
    confirmVariant: "danger",
    confirmingLabel: "Moving to trash...",
  };
}

export function savedSearchDeleteConfirmation(name) {
  return {
    title: "Delete saved search?",
    message: `"${name}" will be removed from your saved searches. This cannot be undone.`,
    confirmLabel: "Delete search",
    confirmVariant: "danger",
    confirmingLabel: "Deleting...",
  };
}

export function favoriteRemoveConfirmation(title) {
  return {
    title: "Remove from favorites?",
    message: `"${title}" will be removed from your favorites list.`,
    confirmLabel: "Remove",
    confirmVariant: "danger",
    confirmingLabel: "Removing...",
  };
}

export function bookingCancelConfirmation() {
  return {
    title: "Cancel tour request?",
    message:
      "Your scheduled tour request will be cancelled. You can request a new visit later.",
    confirmLabel: "Cancel request",
    confirmVariant: "danger",
    confirmingLabel: "Cancelling...",
  };
}

export function bookingRejectConfirmation() {
  return {
    title: "Reject tour request?",
    message: "The buyer will be notified that this visit request was declined.",
    confirmLabel: "Reject request",
    confirmVariant: "danger",
    confirmingLabel: "Rejecting...",
  };
}

export function bookingApproveConfirmation() {
  return {
    title: "Approve tour request?",
    message: "The buyer will be notified that this visit has been approved.",
    confirmLabel: "Approve request",
    confirmingLabel: "Approving...",
  };
}

export function bookingCompleteConfirmation() {
  return {
    title: "Mark tour as completed?",
    message: "This visit will be marked as completed in your booking history.",
    confirmLabel: "Mark completed",
    confirmingLabel: "Updating...",
  };
}

export function transactionApproveConfirmation() {
  return {
    title: "Approve transaction?",
    message:
      "This confirms you accept the transaction terms. The other party will be notified.",
    confirmLabel: "Approve",
    confirmingLabel: "Approving...",
  };
}

export function transactionCancelConfirmation() {
  return {
    title: "Cancel transaction?",
    message:
      "This transaction request will be cancelled. The other party will be notified.",
    confirmLabel: "Cancel transaction",
    confirmVariant: "danger",
    confirmingLabel: "Cancelling...",
  };
}

export function transactionCompleteConfirmation() {
  return {
    title: "Complete transaction?",
    message:
      "This marks the transaction as finished. Make sure all terms have been fulfilled.",
    confirmLabel: "Mark completed",
    confirmingLabel: "Completing...",
  };
}

export function adminApproveListingConfirmation(title) {
  return {
    title: "Approve listing?",
    message: `"${title}" will go live and appear in public search results.`,
    confirmLabel: "Approve listing",
    confirmingLabel: "Approving...",
  };
}

export function adminReturnDraftConfirmation(title) {
  return {
    title: "Return listing to draft?",
    message: `"${title}" will be sent back to the seller as a draft. They will need to resubmit it for review.`,
    confirmLabel: "Return to draft",
    confirmVariant: "danger",
    confirmingLabel: "Updating...",
  };
}

export function adminArchiveListingConfirmation(title) {
  return {
    title: "Archive listing?",
    message: `"${title}" will be hidden from public search and marked as archived.`,
    confirmLabel: "Archive listing",
    confirmVariant: "danger",
    confirmingLabel: "Archiving...",
  };
}

export function propertyPublishConfirmation(isEdit) {
  if (isEdit) {
    return {
      title: "Submit for review?",
      message:
        "Your changes will be sent to an admin for approval before the listing goes live again.",
      confirmLabel: "Submit for review",
      confirmingLabel: "Submitting...",
    };
  }
  return {
    title: "Publish listing?",
    message:
      "Your listing will be submitted for admin review before it appears publicly.",
    confirmLabel: "Publish listing",
    confirmingLabel: "Publishing...",
  };
}

export function propertyMediaDeleteConfirmation() {
  return {
    title: "Delete media?",
    message:
      "This photo or video will be permanently removed from the property.",
    confirmLabel: "Delete media",
    confirmVariant: "danger",
    confirmingLabel: "Removing...",
  };
}
