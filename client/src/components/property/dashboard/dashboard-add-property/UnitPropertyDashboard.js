"use client";

import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import PropertyForm from "@/components/property/dashboard/dashboard-add-property/PropertyForm";

export default function UnitPropertyDashboard({ projectId, propertyId }) {
  return (
    <>
      <div className="row pb20 d-block d-lg-none">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <PropertyForm
        propertyId={propertyId}
        projectId={projectId}
        unitDashboardLayout
      />
    </>
  );
}
