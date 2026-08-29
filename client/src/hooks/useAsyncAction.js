"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiError } from "@/lib/auth/getApiError";
import {
  dismissToast,
  notifyLoading,
  notifyLoadingError,
  notifyLoadingSuccess,
  updateLoadingToast,
} from "@/lib/toast";

/**
 * Runs async work with a loading toast and optional full-page overlay.
 *
 * @param {{ overlay?: boolean }} [options]
 * - overlay: when true, blocks page interaction and warns on tab close
 */
export function useAsyncAction({ overlay = false } = {}) {
  const [isBusy, setIsBusy] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const loadingIdRef = useRef(undefined);

  useEffect(() => {
    if (!overlay || !overlayMessage) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [overlay, overlayMessage]);

  const setProgress = useCallback(
    (message) => {
      if (loadingIdRef.current) {
        updateLoadingToast(loadingIdRef.current, message);
      }
      if (overlay) {
        setOverlayMessage(message);
      }
    },
    [overlay],
  );

  const run = useCallback(
    async ({
      message,
      task,
      successMessage,
      errorMessage,
      showToast = true,
    }) => {
      const loadingId = showToast ? notifyLoading(message) : undefined;
      loadingIdRef.current = loadingId;
      setIsBusy(true);
      if (overlay) {
        setOverlayMessage(message);
      }

      try {
        const result = await task({ setProgress });
        const success =
          typeof successMessage === "function"
            ? successMessage(result)
            : successMessage;

        if (showToast && loadingId) {
          if (success) {
            notifyLoadingSuccess(loadingId, success);
          } else {
            dismissToast(loadingId);
          }
        }

        return result;
      } catch (error) {
        if (showToast && loadingId) {
          notifyLoadingError(loadingId, errorMessage ?? getApiError(error));
        }
        throw error;
      } finally {
        loadingIdRef.current = undefined;
        setIsBusy(false);
        if (overlay) {
          setOverlayMessage("");
        }
      }
    },
    [overlay, setProgress],
  );

  return { run, isBusy, overlayMessage, setProgress };
}
