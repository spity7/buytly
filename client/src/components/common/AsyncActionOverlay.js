"use client";

import LoadingOverlay from "@/components/common/LoadingOverlay";

const AsyncActionOverlay = ({ message }) => (
  <LoadingOverlay open={Boolean(message)} message={message || "Loading..."} />
);

export default AsyncActionOverlay;
