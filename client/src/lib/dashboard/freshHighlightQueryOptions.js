import { keepPreviousData } from "@tanstack/react-query";

export function getFreshQueryOptions(highlightId) {
  if (!highlightId) {
    return { placeholderData: keepPreviousData };
  }

  return {
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: undefined,
  };
}
