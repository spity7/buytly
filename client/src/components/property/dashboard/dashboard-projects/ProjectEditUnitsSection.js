"use client";

import DashboardTableEmptyState from "@/components/property/dashboard/DashboardTableEmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import { PRICE_FROM_LABEL } from "@/lib/properties/formatPrice";
import Link from "next/link";

export default function ProjectEditUnitsSection({
  units,
  minUnits,
  projectId,
  canAddUnit,
}) {
  const unitCount = units.length;

  return (
    <section
      className="project-edit-section"
      aria-labelledby="project-units-heading"
    >
      <div className="project-edit-section__head">
        <div>
          <h4
            id="project-units-heading"
            className="project-edit-section__title mb5"
          >
            Units
          </h4>
          <p className="project-edit-section__lede mb0">
            Sellable listings under this project. Draft units are submitted with
            the project for review.
          </p>
        </div>
        {canAddUnit ? (
          <Link
            href={`/dashboard-add-property?projectId=${projectId}`}
            className="ud-btn btn-thm project-edit-section__head-action"
          >
            Add unit
          </Link>
        ) : null}
      </div>

      {unitCount === 0 ? (
        <DashboardTableEmptyState
          className="project-edit-units-empty"
          icon="flaticon-home"
          title="No units yet"
          description={`Add at least ${minUnits} unit${
            minUnits === 1 ? "" : "s"
          } before you can submit this project for review.`}
          actions={
            canAddUnit
              ? [
                  {
                    label: "Add first unit",
                    variant: "thm",
                    href: `/dashboard-add-property?projectId=${projectId}`,
                  },
                ]
              : []
          }
        />
      ) : (
        <div className="table-responsive project-edit-units-table">
          <table className="table-style3 table at-savesearch mb0">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Title</th>
                <th scope="col">{PRICE_FROM_LABEL}</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => {
                const id = unit._id || unit.id;
                return (
                  <tr key={id}>
                    <td className="vam text-capitalize">{unit.type || "—"}</td>
                    <td className="vam">{unit.title}</td>
                    <td className="vam">
                      {unit.price != null
                        ? `$${unit.price.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="vam">
                      <StatusBadge domain="listing" status={unit.status} />
                    </td>
                    <td className="vam text-end">
                      <Link
                        href={`/dashboard-edit-property/${id}`}
                        className="text-thm fw600"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
