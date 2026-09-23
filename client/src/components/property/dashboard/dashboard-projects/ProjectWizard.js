"use client";

import { buytlyApi } from "@/api/generated";
import ProjectFormFields from "@/components/property/dashboard/dashboard-projects/ProjectFormFields";
import { useCatalogAmenities } from "@/hooks/useCatalog";
import {
  buildProjectPayload,
  emptyProjectFormState,
} from "@/lib/properties/projectForm";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { notifyError } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState(() => emptyProjectFormState());
  const { run, isBusy: busy } = useAsyncAction();
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

  const handleCreate = async (event) => {
    event.preventDefault();
    const result = buildProjectPayload(form, {
      includeAgentId: showAgentSelect,
    });
    if (result.error) {
      notifyError(result.error);
      return;
    }

    try {
      await run({
        message: "Creating project...",
        successMessage: "Project created",
        task: async () => {
          const response = await buytlyApi.createProject({
            ...result.payload,
            status: "draft",
          });
          const projectId = response.data?._id || response.data?.id;
          router.push(`/dashboard-edit-project/${projectId}`);
        },
      });
    } catch {
      // Toast handled by run()
    }
  };

  return (
    <form className="form-style1 p30 project-wizard" onSubmit={handleCreate}>
      <div className="project-wizard__step-header mb25">
        <h4 className="mb5">New project</h4>
        <p className="text mb0">
          Set shared location and marketing details, then add sellable units on
          the next screen.
        </p>
      </div>

      <ProjectFormFields
        form={form}
        onUpdate={update}
        onLocationPick={updateLocation}
        onToggleAmenity={toggleAmenity}
        amenitiesCatalog={amenitiesCatalog}
        disabled={busy}
        showAgentSelect={showAgentSelect}
      />

      <div className="project-wizard-actions">
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
