"use client";

import Link from "next/link";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";

export default function ProjectDetailBreadcrumb() {
  const { project } = useProjectSingle();
  if (!project?.title) return null;

  return (
    <div className="col-12 mb20">
      <nav aria-label="Project breadcrumb" className="breadcumb-style1">
        <div className="breadcumb-list">
          <Link href="/">Home</Link>
          <Link href="/listings?view=projects">Projects</Link>
          <span>{project.title}</span>
        </div>
      </nav>
    </div>
  );
}
