"use client";

import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

const DashboardFormSubmit = ({
  isDirty,
  isSubmitting,
  idleLabel,
  submittingLabel,
}) => {
  const isDisabled = isSubmitting || !isDirty;

  return (
    <div className="dashboard-form-actions">
      <button
        type="submit"
        className="ud-btn btn-dark dashboard-form-actions__btn"
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        <DashboardBtnIcon icon={dashboardIcons.save} />
        {isSubmitting ? submittingLabel : idleLabel}
        <DashboardBtnIcon
          icon={dashboardIcons.arrowRight}
          position="trailArrow"
        />
      </button>
    </div>
  );
};

export default DashboardFormSubmit;
