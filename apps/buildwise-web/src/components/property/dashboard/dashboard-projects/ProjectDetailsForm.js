"use client";

import DashboardBtnIcon, {
  dashboardIcons,
} from "@/components/property/dashboard/DashboardBtnIcon";

import ProjectFormFields from "@/components/property/dashboard/dashboard-projects/ProjectFormFields";
import { useCatalogAmenities } from "@/hooks/useCatalog";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import {
  buildProjectPayload,
  isProjectFormDirty,
  projectToFormState,
} from "@/lib/properties/projectForm";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useMemo, useState } from "react";

export { projectToFormState } from "@/lib/properties/projectForm";

export default function ProjectDetailsForm({
  project,
  disabled = false,
  hideSubmit = false,
  onSubmit,
  onDirtyChange,
  submitLabel = "Save project details",
}) {
  const { user } = useAuth();
  const { data: amenitiesCatalog = [] } = useCatalogAmenities();
  const [form, setForm] = useState(() => projectToFormState(project));
  const { isLocked } = useConfirmAction();

  useEffect(() => {
    setForm(projectToFormState(project));
  }, [project]);

  const showAgentSelect = user?.role === "seller" || user?.role === "admin";
  const formDisabled = disabled || isLocked;
  const baselineForm = useMemo(() => projectToFormState(project), [project]);
  const isDirty = useMemo(
    () => isProjectFormDirty(form, baselineForm),
    [baselineForm, form],
  );
  const saveDisabled = formDisabled || !isDirty;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocation = ({ latitude, longitude }) => {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  };

  const toggleAmenity = (value) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((item) => item !== value)
        : [...prev.amenities, value],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = buildProjectPayload(form, {
      includeAgentId: showAgentSelect,
    });
    if (result.error) {
      onSubmit({ error: result.error });
      return;
    }
    onSubmit(result.payload);
  };

  return (
    <form className="project-edit-section" onSubmit={handleSubmit}>
      <h4 className="project-edit-section__title mb5">Project details</h4>
      <p className="project-edit-section__lede mb25">
        Location, description, and amenities shared across all units on this
        project page.
      </p>

      <ProjectFormFields
        form={form}
        onUpdate={update}
        onLocationPick={updateLocation}
        onToggleAmenity={toggleAmenity}
        amenitiesCatalog={amenitiesCatalog}
        disabled={formDisabled}
        showAgentSelect={showAgentSelect}
      />

      {!hideSubmit ? (
        <div className="project-wizard-actions">
          <button
            type="submit"
            className="ud-btn btn-thm project-wizard-actions__btn"
            disabled={saveDisabled}
            title={
              !isDirty && !formDisabled
                ? "Make changes to enable save"
                : undefined
            }
          >
            <DashboardBtnIcon icon={dashboardIcons.save} />
            {submitLabel}
          </button>
          {!isDirty && !formDisabled ? (
            <p className="project-wizard-actions__hint mb0">
              Edit the form to enable save.
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
