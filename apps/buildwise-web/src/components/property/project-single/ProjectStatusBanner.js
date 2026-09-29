"use client";

import StatusBadge from "@/components/common/StatusBadge";
import { useProjectSingle } from "@/providers/ProjectSingleProvider";

export default function ProjectStatusBanner() {
  const { project } = useProjectSingle();
  const status = project?.status;

  if (!status || status === "active") return null;

  return (
    <div
      className={`property-status-banner property-status-banner--${status} mb30`}
      role="status"
    >
      <StatusBadge domain="listing" status={status} />
      {status === "pending" && (
        <p className="mb0 mt-2">
          This project is not public yet. Only the owner and admins can view it.
        </p>
      )}
      {status === "draft" && (
        <p className="mb0 mt-2">
          This is a draft project and is not visible to the public.
        </p>
      )}
      {status === "sold" && (
        <p className="mb0 mt-2">
          This development is fully sold. Unit details may still be shown for
          reference.
        </p>
      )}
      {status === "archived" && (
        <p className="mb0 mt-2">
          This project is archived and no longer accepts inquiries.
        </p>
      )}
    </div>
  );
}
