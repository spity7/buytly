"use client";

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
        {isSubmitting ? submittingLabel : idleLabel}
        <i className="fal fa-arrow-right-long" />
      </button>
    </div>
  );
};

export default DashboardFormSubmit;
