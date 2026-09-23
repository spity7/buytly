"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import ProjectFormFields from "@/components/property/dashboard/dashboard-projects/ProjectFormFields";
import { useCatalogAmenities } from "@/hooks/useCatalog";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { projectKindChangeConfirmation } from "@/lib/confirmations";
import { getProjectKindLabel } from "@/lib/properties/projectKindOptions";
import {
  buildProjectPayload,
  canChangeProjectKind,
  countProjectUnitsForKind,
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
  submitLabel = "Save project details",
}) {
  const { user } = useAuth();
  const { data: amenitiesCatalog = [] } = useCatalogAmenities();
  const [form, setForm] = useState(() => projectToFormState(project));
  const { requestConfirm, dialogProps, isLocked } = useConfirmAction();

  useEffect(() => {
    setForm(projectToFormState(project));
  }, [project]);

  const unitCount = useMemo(() => countProjectUnitsForKind(project), [project]);

  const kindMode = useMemo(() => {
    if (!project) return "hidden";
    if (!canChangeProjectKind(project, unitCount)) return "readonly";
    return "editable";
  }, [project, unitCount]);

  const showAgentSelect = user?.role === "seller" || user?.role === "admin";
  const formDisabled = disabled || isLocked;

  const applyFieldUpdate = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const update = (field, value) => {
    if (field === "kind" && value !== form.kind) {
      requestConfirm({
        ...projectKindChangeConfirmation(getProjectKindLabel(value)),
        action: {
          showToast: false,
          task: async () => {
            applyFieldUpdate("kind", value);
          },
        },
      });
      return;
    }
    applyFieldUpdate(field, value);
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
      includeKind: kindMode === "editable",
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
      <ConfirmDialog {...dialogProps} />

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
        kindMode={kindMode}
        showAgentSelect={showAgentSelect}
      />

      {!hideSubmit ? (
        <div className="project-wizard-actions">
          <button
            type="submit"
            className="ud-btn btn-thm project-wizard-actions__btn"
            disabled={formDisabled}
          >
            {submitLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
}
