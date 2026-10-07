"use client";

import { useSearchParams } from "next/navigation";
import InquireForm from "./InquireForm";

/**
 * Reads `?type=` and `?unit=` and renders the pre-filled form. Uses
 * useSearchParams, so the page renders it inside <Suspense> (the page stays
 * statically generated; the fallback is the same form without pre-fill).
 * Keyed by the query so a new link starts a fresh, correctly pre-filled form.
 */
export default function InquireFormFromParams() {
  const searchParams = useSearchParams();
  const type = String(searchParams?.get("type") ?? "").trim();
  const unit = String(searchParams?.get("unit") ?? "").trim();

  return (
    <InquireForm key={`${type}|${unit}`} initialType={type} unitId={unit} />
  );
}
