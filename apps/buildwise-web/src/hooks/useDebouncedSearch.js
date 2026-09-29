"use client";

import { useEffect, useState } from "react";

export function useDebouncedSearch(
  initialValue = "",
  delayMs = 300,
  onDebounced,
) {
  const [input, setInput] = useState(initialValue);
  const [search, setSearch] = useState(initialValue.trim());

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = input.trim();
      setSearch(trimmed);
      onDebounced?.(trimmed);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [input, delayMs, onDebounced]);

  return [input, setInput, search];
}
