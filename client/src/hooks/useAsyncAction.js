"use client";

import { useAsyncActionOverlayBridge } from "@/providers/AsyncActionOverlayProvider";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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
 * - overlay: when true (default), blocks page interaction via AsyncActionOverlayProvider
 */
export function useAsyncAction({ overlay = true } = {}) {
  const overlayBridge = useAsyncActionOverlayBridge();
  const sessionId = useId();
  const [isBusy, setIsBusy] = useState(false);
  const [localOverlayMessage, setLocalOverlayMessage] = useState("");
  const loadingIdRef = useRef(undefined);

  const usesGlobalOverlay = overlay && Boolean(overlayBridge);
  const overlayMessage = usesGlobalOverlay ? "" : localOverlayMessage;

  useEffect(() => {
    if (!overlay || usesGlobalOverlay || !isBusy) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [overlay, usesGlobalOverlay, isBusy]);

  const setProgress = useCallback(
    (message) => {
      if (loadingIdRef.current) {
        updateLoadingToast(loadingIdRef.current, message);
      }
      if (!overlay) {
        return;
      }
      if (usesGlobalOverlay) {
        overlayBridge.begin(sessionId, message);
      } else {
        setLocalOverlayMessage(message);
      }
    },
    [overlay, overlayBridge, sessionId, usesGlobalOverlay],
  );

  const clearOverlay = useCallback(() => {
    if (!overlay) {
      return;
    }
    if (usesGlobalOverlay) {
      overlayBridge.end(sessionId);
    } else {
      setLocalOverlayMessage("");
    }
  }, [overlay, overlayBridge, sessionId, usesGlobalOverlay]);

  const showOverlay = useCallback(
    (message) => {
      if (!overlay) {
        return;
      }
      if (usesGlobalOverlay) {
        overlayBridge.begin(sessionId, message);
      } else {
        setLocalOverlayMessage(message);
      }
    },
    [overlay, overlayBridge, sessionId, usesGlobalOverlay],
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
      showOverlay(message);

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
        clearOverlay();
      }
    },
    [clearOverlay, showOverlay],
  );

  return { run, isBusy, overlayMessage, setProgress };
}
