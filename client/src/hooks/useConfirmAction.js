"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsyncAction } from "./useAsyncAction";

/**
 * Combines ConfirmDialog flow with useAsyncAction.
 *
 * Call `requestConfirm({ title, message, ..., action: { message, task, ... } })`
 * to open a dialog. On confirm, runs the nested action with loading toast/overlay.
 */
export function useConfirmAction({ overlay = false } = {}) {
  const { run, isBusy, overlayMessage } = useAsyncAction({ overlay });
  const [pending, setPending] = useState(null);

  const requestConfirm = useCallback((config) => {
    setPending(config);
  }, []);

  const closeConfirm = useCallback(() => {
    if (!isBusy) {
      setPending(null);
    }
  }, [isBusy]);

  const confirmPending = useCallback(async () => {
    if (!pending?.action) {
      return;
    }

    const { message, successMessage, errorMessage, task, onSuccess } =
      pending.action;

    try {
      await run({ message, successMessage, errorMessage, task });
      onSuccess?.();
      setPending(null);
    } catch {
      setPending(null);
    }
  }, [pending, run]);

  const dialogProps = useMemo(
    () => ({
      open: Boolean(pending),
      title: pending?.title ?? "",
      message: pending?.message ?? "",
      confirmLabel: pending?.confirmLabel ?? "Confirm",
      cancelLabel: pending?.cancelLabel ?? "Cancel",
      confirmVariant: pending?.confirmVariant ?? "default",
      confirmingLabel: pending?.confirmingLabel ?? "Working...",
      isConfirming: isBusy,
      onClose: closeConfirm,
      onConfirm: confirmPending,
    }),
    [pending, isBusy, closeConfirm, confirmPending],
  );

  const isLocked = Boolean(pending) || isBusy;

  return {
    requestConfirm,
    run,
    isBusy,
    isLocked,
    pending,
    overlayMessage,
    dialogProps,
  };
}
