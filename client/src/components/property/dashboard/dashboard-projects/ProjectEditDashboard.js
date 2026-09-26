"use client";

import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import ProjectEditPanel from "@/components/property/dashboard/dashboard-projects/ProjectEditPanel";

export default function ProjectEditDashboard({ projectId }) {
  return (
    <>
      <div className="row pb20 d-block d-lg-none">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <ProjectEditPanel projectId={projectId} />
    </>
  );
}
