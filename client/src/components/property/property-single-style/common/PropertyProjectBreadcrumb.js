"use client";

import Link from "next/link";
import { usePropertySingle } from "@/providers/PropertySingleProvider";

export default function PropertyProjectBreadcrumb() {
  const { property, card } = usePropertySingle();
  const project = property?.projectId;
  const slug = project?.slug;
  const title =
    project?.title || card?.projectTitle || property?.project?.title;

  if (!title) return null;

  return (
    <div className="col-12 mb20">
      <nav aria-label="Project breadcrumb" className="breadcumb-style1">
        <div className="breadcumb-list">
          <Link href="/">Home</Link>
          <Link href="/listings">Listings</Link>
          {slug ? (
            <Link href={`/project/${slug}`}>{title}</Link>
          ) : (
            <span>{title}</span>
          )}
          <span>{card?.title || property?.title}</span>
        </div>
      </nav>
    </div>
  );
}
