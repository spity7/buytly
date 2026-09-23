"use client";

import FormFieldError from "@/components/common/FormFieldError";
import ProjectKindSelector from "@/components/property/dashboard/dashboard-projects/ProjectKindSelector";
import PropertyLocationPicker from "@/components/property/dashboard/dashboard-add-property/PropertyLocationPicker";
import {
  getProjectKindLabel,
  PROJECT_KIND_FORM_DESCRIPTION,
} from "@/lib/properties/projectKindOptions";
import { useAgents } from "@/hooks/useAgents";
import { getAgentDisplayName, getAgentUserId } from "@/lib/agents/mapAgent";
import { getVirtualTourUrlFieldError } from "@/lib/properties/fieldErrors";
import { useMemo, useState } from "react";

function VirtualTourField({
  disabled,
  value,
  virtualTourError,
  onChange,
  onBlur,
  onSyncError,
}) {
  const trimmed = (value ?? "").trim();
  const label = "360° virtual tour URL";
  const labelEl = (
    <label
      className="heading-color ff-heading fw600 mb10"
      htmlFor={disabled ? undefined : "project-virtual-tour"}
    >
      {label}
    </label>
  );

  if (disabled) {
    return (
      <>
        {labelEl}
        {trimmed ? (
          <p className="mb0">
            <a
              href={trimmed}
              className="text-thm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {trimmed}
            </a>
          </p>
        ) : (
          <p className="text-muted mb0">Not set</p>
        )}
      </>
    );
  }

  return (
    <>
      {labelEl}
      <input
        id="project-virtual-tour"
        className="form-control"
        type="url"
        placeholder="https://my.matterport.com/show/?m=..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (virtualTourError) {
            onSyncError(e.target.value);
          }
        }}
        onBlur={onBlur}
        aria-invalid={Boolean(virtualTourError)}
        aria-describedby={
          virtualTourError ? "project-virtual-tour-error" : undefined
        }
      />
      <FormFieldError
        id="project-virtual-tour-error"
        message={virtualTourError}
      />
    </>
  );
}

export default function ProjectFormFields({
  form,
  onUpdate,
  onLocationPick,
  onToggleAmenity,
  amenitiesCatalog = [],
  disabled = false,
  kindMode = "hidden",
  showAgentSelect = false,
}) {
  const [virtualTourError, setVirtualTourError] = useState("");
  const { data: agentsData, isLoading: agentsLoading } = useAgents(
    { page: 1, limit: 100 },
    { enabled: showAgentSelect },
  );

  const agentOptions = useMemo(() => {
    const agents = agentsData?.agents || [];
    return agents
      .map((agent) => {
        const id = getAgentUserId(agent);
        if (!id) return null;
        return { value: id, label: getAgentDisplayName(agent) };
      })
      .filter(Boolean);
  }, [agentsData?.agents]);

  const syncVirtualTourError = (value) => {
    setVirtualTourError(getVirtualTourUrlFieldError(value));
  };

  return (
    <div className="row">
      {kindMode !== "hidden" ? (
        <div className="col-sm-12 mb20">
          {kindMode === "readonly" ? (
            <>
              <h5 className="fz17 mb15">Project type</h5>
              <p className="mb0 text">
                {getProjectKindLabel(form.kind)}
                <span className="d-block fz14 text-muted mt5">
                  Type cannot be changed after units are added. Contact support
                  if you need to restructure this project.
                </span>
              </p>
            </>
          ) : (
            <ProjectKindSelector
              value={form.kind}
              onChange={(kind) => onUpdate("kind", kind)}
              disabled={disabled}
              legend="Project type"
              description={PROJECT_KIND_FORM_DESCRIPTION}
            />
          )}
        </div>
      ) : null}

      <div className="col-sm-12">
        <h5 className="fz17 mb15">Basics</h5>
      </div>
      <div className="col-sm-12 mb20">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor="project-title"
        >
          Title
        </label>
        <input
          id="project-title"
          className="form-control"
          value={form.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          required
          minLength={3}
          disabled={disabled}
        />
      </div>
      <div className="col-sm-12 mb20">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor="project-description"
        >
          Description
        </label>
        <textarea
          id="project-description"
          className="form-control"
          rows={4}
          value={form.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          required
          minLength={10}
          disabled={disabled}
        />
      </div>

      {showAgentSelect ? (
        <div className="col-sm-12 mb20">
          <h5 className="fz17 mb15">Listing agent</h5>
          <label
            className="heading-color ff-heading fw600 mb10"
            htmlFor="project-agent"
          >
            Assigned agent
          </label>
          <select
            id="project-agent"
            className="form-control"
            value={form.agentId}
            onChange={(e) => onUpdate("agentId", e.target.value)}
            disabled={disabled || agentsLoading}
          >
            <option value="">Owner handles inquiries</option>
            {agentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="fz14 text-muted mb0 mt10">
            Optional. The assigned agent appears on the public project page and
            receives booking notifications for units in this project.
          </p>
        </div>
      ) : null}

      <div className="col-sm-12">
        <h5 className="fz17 mb15">Location</h5>
      </div>
      <div className="col-sm-12 mb20">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor="project-address"
        >
          Street address
        </label>
        <input
          id="project-address"
          className="form-control"
          value={form.address}
          onChange={(e) => onUpdate("address", e.target.value)}
          disabled={disabled}
          placeholder="Building, street, or landmark"
        />
      </div>
      <div className="col-sm-6 mb20">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor="project-city"
        >
          City
        </label>
        <input
          id="project-city"
          className="form-control"
          value={form.city}
          onChange={(e) => onUpdate("city", e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="col-sm-6 mb20">
        <label
          className="heading-color ff-heading fw600 mb10"
          htmlFor="project-country"
        >
          Country
        </label>
        <input
          id="project-country"
          className="form-control"
          value={form.country}
          onChange={(e) => onUpdate("country", e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="col-sm-12 mb20">
        <label className="heading-color ff-heading fw600 mb10">Map pin</label>
        <PropertyLocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={
            onLocationPick ||
            ((coords) => {
              onUpdate("latitude", coords.latitude);
              onUpdate("longitude", coords.longitude);
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="col-sm-12">
        <h5 className="fz17 mb15">Media &amp; tour</h5>
      </div>
      <div className="col-sm-12 mb20">
        <VirtualTourField
          disabled={disabled}
          value={form.virtualTourUrl}
          virtualTourError={virtualTourError}
          onChange={(next) => onUpdate("virtualTourUrl", next)}
          onBlur={() => syncVirtualTourError(form.virtualTourUrl)}
          onSyncError={syncVirtualTourError}
        />
        {!disabled ? (
          <p className="fz14 text-muted mb0 mt10">
            Gallery photos and hero video are uploaded in the project media
            section on the edit page.
          </p>
        ) : null}
      </div>

      <div className="col-sm-12 mb20">
        <h5 className="fz17 mb15">Shared amenities</h5>
        {amenitiesCatalog.length === 0 ? (
          <p className="text-muted mb0 fz14">No amenities configured yet.</p>
        ) : (
          <div className="row">
            {amenitiesCatalog.map((item) => (
              <div className="col-sm-6 col-md-4" key={item.value}>
                <label className="custom_checkbox">
                  {item.label}
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(item.value)}
                    onChange={() => onToggleAmenity(item.value)}
                    disabled={disabled}
                  />
                  <span className="checkmark" />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
