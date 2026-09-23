"use client";

import { buytlyApi } from "@/api/generated";
import ProjectFormFields from "@/components/property/dashboard/dashboard-projects/ProjectFormFields";
import ProjectKindSelector from "@/components/property/dashboard/dashboard-projects/ProjectKindSelector";
import ProjectWizardSteps from "@/components/property/dashboard/dashboard-projects/ProjectWizardSteps";
import { useCatalogAmenities } from "@/hooks/useCatalog";
import { getApiError } from "@/lib/auth/getApiError";
import {
  getProjectKindLabel,
  PROJECT_KIND_INTRO_DESCRIPTION,
} from "@/lib/properties/projectKindOptions";
import {
  buildProjectPayload,
  emptyProjectFormState,
} from "@/lib/properties/projectForm";
import { notifyError } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState(() => emptyProjectFormState());
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const { data: amenitiesCatalog = [] } = useCatalogAmenities();

  const showAgentSelect = user?.role === "seller" || user?.role === "admin";

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

  const goToDetailsStep = () => {
    if (!form.kind) return;
    setStep(2);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const result = buildProjectPayload(form, {
      includeKind: true,
      includeAgentId: showAgentSelect,
    });
    if (result.error) {
      notifyError(result.error);
      return;
    }

    setBusy(true);
    try {
      const response = await buytlyApi.createProject({
        ...result.payload,
        status: "draft",
      });
      const projectId = response.data?._id || response.data?.id;
      router.push(`/dashboard-edit-project/${projectId}`);
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setBusy(false);
    }
  };

  if (step === 1) {
    return (
      <form
        className="form-style1 p30 project-wizard"
        onSubmit={(event) => {
          event.preventDefault();
          goToDetailsStep();
        }}
      >
        <ProjectWizardSteps currentStep={1} />
        <ProjectKindSelector
          value={form.kind}
          onChange={(kind) => update("kind", kind)}
          legend="Choose project type"
          description={PROJECT_KIND_INTRO_DESCRIPTION}
        />
        <div className="project-wizard-actions">
          {!form.kind ? (
            <p className="project-wizard-actions__hint mb0">
              Select a project type to continue.
            </p>
          ) : null}
          <button
            type="submit"
            className="ud-btn btn-thm project-wizard-actions__btn project-wizard-actions__btn--with-icon"
            disabled={!form.kind}
          >
            Continue
            <i className="fal fa-arrow-right-long" aria-hidden="true" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="form-style1 p30 project-wizard" onSubmit={handleCreate}>
      <ProjectWizardSteps currentStep={2} />
      <div className="project-wizard__step-header">
        <div>
          <h4 className="mb5">Project details</h4>
          <p className="text mb0">
            {getProjectKindLabel(form.kind)} project — fill in location and
            listing basics before adding units.
          </p>
          <p className="fz14 text-muted mb0 mt10">
            {form.kind === "single"
              ? "Next you will add one Villa unit on the project edit page."
              : "Add at least one unit before you can publish (more units can be added anytime)."}
          </p>
        </div>
        <button
          type="button"
          className="ud-btn btn-white2 btn-sm project-wizard__change-type"
          onClick={() => setStep(1)}
          disabled={busy}
        >
          Change type
        </button>
      </div>

      <ProjectFormFields
        form={form}
        onUpdate={update}
        onLocationPick={updateLocation}
        onToggleAmenity={toggleAmenity}
        amenitiesCatalog={amenitiesCatalog}
        disabled={busy}
        kindMode="hidden"
        showAgentSelect={showAgentSelect}
      />

      <div className="project-wizard-actions project-wizard-actions--split">
        <button
          type="button"
          className="ud-btn btn-white2 project-wizard-actions__btn"
          onClick={() => setStep(1)}
          disabled={busy}
        >
          Back
        </button>
        <button
          type="submit"
          className="ud-btn btn-thm project-wizard-actions__btn"
          disabled={busy}
        >
          {busy ? "Creating..." : "Create project & add units"}
        </button>
      </div>
    </form>
  );
}
