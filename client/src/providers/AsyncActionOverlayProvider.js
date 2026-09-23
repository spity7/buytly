"use client";

import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const AsyncActionOverlayContext = createContext(null);

export function useAsyncActionOverlayBridge() {
  return useContext(AsyncActionOverlayContext);
}

/**
 * Single app-wide loading overlay for useAsyncAction / useConfirmAction.
 * Mount once in ClientLayout so all mutations share the same busy UX.
 */
export function AsyncActionOverlayProvider({ children }) {
  const sessionsRef = useRef(new Map());
  const [message, setMessage] = useState("");

  const syncMessage = useCallback(() => {
    if (sessionsRef.current.size === 0) {
      setMessage("");
      return;
    }
    const values = [...sessionsRef.current.values()];
    setMessage(values[values.length - 1] ?? "");
  }, []);

  const begin = useCallback(
    (sessionId, nextMessage) => {
      sessionsRef.current.set(sessionId, nextMessage);
      syncMessage();
    },
    [syncMessage],
  );

  const end = useCallback(
    (sessionId) => {
      sessionsRef.current.delete(sessionId);
      syncMessage();
    },
    [syncMessage],
  );

  const value = useMemo(() => ({ begin, end }), [begin, end]);

  const isBlocking = Boolean(message);

  useEffect(() => {
    if (!isBlocking) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isBlocking]);

  return (
    <AsyncActionOverlayContext.Provider value={value}>
      {children}
      <AsyncActionOverlay message={message} />
    </AsyncActionOverlayContext.Provider>
  );
}
