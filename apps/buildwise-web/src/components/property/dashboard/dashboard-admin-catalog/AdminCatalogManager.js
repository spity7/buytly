"use client";

import { useEffect, useMemo, useState } from "react";
import { customInstance } from "@/lib/api/custom-instance";
import {
  useAdminCatalogAmenities,
  useAdminCatalogPropertyTypes,
} from "@/hooks/useCatalog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import {
  catalogItemDeactivateConfirmation,
  catalogItemDeleteConfirmation,
} from "@/lib/confirmations";
import {
  DashboardFilterBar,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { Tooltip as ReactTooltip } from "react-tooltip";
import ApiPagination from "@/components/property/ApiPagination";
const CATALOG_PAGE_SIZE = 10;

const PROTECTED_PROPERTY_TYPE_VALUES = new Set();

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
];

const emptyTypeForm = {
  value: "",
  label: "",
  sortOrder: "0",
  isActive: true,
};

const emptyAmenityForm = {
  value: "",
  label: "",
  sortOrder: "0",
  isActive: true,
};

function slugifyLabel(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCatalogLabel(label) {
  return label.trim().toLowerCase();
}

function findDuplicateCatalogLabel(rows, label, editingId) {
  const normalized = normalizeCatalogLabel(label);
  if (!normalized) return null;

  return (
    rows.find(
      (row) =>
        row.id !== editingId && normalizeCatalogLabel(row.label) === normalized,
    ) ?? null
  );
}

function findDuplicateTypeValue(typeRows, value, editingId) {
  if (!value) return null;

  return (
    typeRows.find((row) => row.id !== editingId && row.value === value) ?? null
  );
}

function catalogAdminFormMatchesRow(row, form) {
  return (
    row.label === form.label.trim() &&
    (Number(form.sortOrder) || 0) === (row.sortOrder ?? 0) &&
    row.isActive === form.isActive
  );
}

function CatalogTabButton({
  label,
  total,
  active,
  isSelected,
  onSelect,
  disabled,
}) {
  const inactive = Math.max(0, total - active);
  const ariaLabel =
    inactive > 0
      ? `${label}, ${total} total, ${active} active`
      : `${label}, ${total} items`;

  return (
    <span
      className={`catalog-admin__tab${
        isSelected ? " catalog-admin__tab--selected" : ""
      }`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        className={`catalog-admin__tab-btn ud-btn btn-sm ${
          isSelected ? "btn-thm" : "btn-white"
        }`}
        onClick={onSelect}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <span className="catalog-admin__tab-label">{label}</span>
        {inactive > 0 ? (
          <span className="catalog-admin__tab-active-note">
            {active} active
          </span>
        ) : null}
      </button>
      <sup className="catalog-admin__tab-count" aria-hidden="true">
        {total}
      </sup>
    </span>
  );
}

function CatalogListEmpty({
  variant,
  entityName,
  entityNamePlural,
  onClearFilter,
}) {
  if (variant === "catalog") {
    return (
      <div className="catalog-admin__empty">
        <span
          className={`catalog-admin__empty-icon ${
            entityName === "amenity" ? "flaticon-like" : "flaticon-home"
          }`}
          aria-hidden
        />
        <h5 className="catalog-admin__empty-title">
          No {entityNamePlural} yet
        </h5>
        <p className="catalog-admin__empty-text">
          Create your first {entityName} with the form on the left. It will
          appear on listing forms and search filters once saved as active.
        </p>
      </div>
    );
  }

  return (
    <div className="catalog-admin__empty">
      <span className="catalog-admin__empty-icon flaticon-search" aria-hidden />
      <h5 className="catalog-admin__empty-title">No matches</h5>
      <p className="catalog-admin__empty-text">
        No {entityNamePlural} match the current status filter. Show all statuses
        or add a new {entityName}.
      </p>
      {onClearFilter ? (
        <button
          type="button"
          className="ud-btn btn-thm btn-sm catalog-admin__empty-action"
          onClick={onClearFilter}
        >
          Show all statuses
        </button>
      ) : null}
    </div>
  );
}

function renderCatalogListPanel({
  isLoading,
  allRows,
  filteredRows,
  skeletonRows,
  entityName,
  entityNamePlural,
  onClearFilter,
  tableProps,
  page,
  pageSize,
  onPageChange,
  paginationItemLabel,
  paginationItemLabelSingular,
  paginationDisabled,
}) {
  if (isLoading) {
    return (
      <DashboardTableSkeleton
        rows={skeletonRows}
        columns={3}
        withThumbnail={false}
      />
    );
  }

  if (!allRows.length) {
    return (
      <div className="catalog-admin__list-panel">
        <CatalogListEmpty
          variant="catalog"
          entityName={entityName}
          entityNamePlural={entityNamePlural}
        />
      </div>
    );
  }

  if (!filteredRows.length) {
    return (
      <div className="catalog-admin__list-panel">
        <CatalogListEmpty
          variant="filter"
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          onClearFilter={onClearFilter}
        />
      </div>
    );
  }

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <>
      <CatalogTable {...tableProps} rows={paginatedRows} />
      <div className="catalog-admin__pagination">
        <ApiPagination
          page={safePage}
          totalPages={totalPages}
          total={total}
          limit={pageSize}
          onPageChange={onPageChange}
          itemLabel={paginationItemLabel}
          itemLabelSingular={paginationItemLabelSingular}
          disabled={paginationDisabled}
        />
      </div>
    </>
  );
}

function CatalogTable({
  rows,
  columns,
  onEdit,
  onDelete,
  onToggleActive,
  busyId,
  actionsDisabled,
  editingId,
}) {
  return (
    <div className="table-responsive">
      <table className="table-style3 table at-savesearch">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowBusy = busyId === row.id;
            const actionWaitTooltip = actionsDisabled
              ? rowBusy
                ? "Working..."
                : "Please wait..."
              : null;
            const isEditing = editingId === row.id;
            const listingCount = row.listingCount ?? 0;
            const isProtectedType = PROTECTED_PROPERTY_TYPE_VALUES.has(
              row.value,
            );
            const editBlocked = isProtectedType;
            const deleteBlocked = listingCount > 0 || isProtectedType;
            const deactivateBlocked = isProtectedType && row.isActive;
            const editTooltip = editBlocked
              ? "Protected type — cannot be edited."
              : "Edit";
            const deleteTooltip = isProtectedType
              ? "Protected type — cannot be removed."
              : deleteBlocked
                ? `Used on ${listingCount} listing${listingCount === 1 ? "" : "s"}. Deactivate instead.`
                : "Delete";
            const toggleLabel = row.isActive ? "Deactivate" : "Activate";
            const toggleTooltip = deactivateBlocked
              ? "Protected type — always stays active."
              : toggleLabel;
            const editTooltipId = `catalog-edit-${row.id}`;
            const toggleTooltipId = `catalog-toggle-${row.id}`;
            const deleteTooltipId = `catalog-delete-${row.id}`;

            return (
              <tr
                key={row.id}
                className={isEditing ? "catalog-admin__row-editing" : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className="vam">
                    {column.render(row)}
                  </td>
                ))}
                <td className="vam">
                  <div className="catalog-admin__actions d-flex align-items-center">
                    <button
                      type="button"
                      className="icon catalog-admin__action-btn catalog-admin__action-btn--edit"
                      disabled={actionsDisabled || editBlocked}
                      data-tooltip-id={editTooltipId}
                      aria-label={`Edit ${row.label}`}
                      onClick={() => onEdit(row)}
                    >
                      <span className="fas fa-pen fa" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={`icon catalog-admin__action-btn ${
                        row.isActive
                          ? "catalog-admin__action-btn--deactivate"
                          : "catalog-admin__action-btn--activate"
                      }`}
                      disabled={actionsDisabled || deactivateBlocked}
                      data-tooltip-id={toggleTooltipId}
                      aria-label={`${toggleLabel} ${row.label}`}
                      onClick={() => onToggleActive(row)}
                    >
                      <span
                        className={
                          row.isActive ? "flaticon-close" : "flaticon-turn-back"
                        }
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className="icon catalog-admin__action-btn catalog-admin__action-btn--delete"
                      disabled={actionsDisabled || deleteBlocked}
                      data-tooltip-id={deleteTooltipId}
                      aria-label={`Delete ${row.label}`}
                      onClick={() => onDelete(row)}
                    >
                      <span className="flaticon-bin" aria-hidden="true" />
                    </button>
                    <ReactTooltip
                      id={editTooltipId}
                      place="top"
                      content={actionWaitTooltip ?? editTooltip}
                    />
                    <ReactTooltip
                      id={toggleTooltipId}
                      place="top"
                      content={actionWaitTooltip ?? toggleTooltip}
                    />
                    <ReactTooltip
                      id={deleteTooltipId}
                      place="top"
                      content={actionWaitTooltip ?? deleteTooltip}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CatalogStatusFilterBar({ id, statusFilter, onChange, disabled }) {
  return (
    <DashboardFilterBar className="mb20 catalog-admin__table-filters">
      <FilterSelect
        id={id}
        label="Status"
        hideLabel
        value={statusFilter}
        options={STATUS_FILTER_OPTIONS}
        disabled={disabled}
        onChange={onChange}
      />
    </DashboardFilterBar>
  );
}

function filterByStatus(rows, statusFilter) {
  if (statusFilter === "active") {
    return rows.filter((row) => row.isActive);
  }
  if (statusFilter === "inactive") {
    return rows.filter((row) => !row.isActive);
  }
  return rows;
}

export default function AdminCatalogManager() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("types");
  const [busyId, setBusyId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [amenityForm, setAmenityForm] = useState(emptyAmenityForm);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingAmenityId, setEditingAmenityId] = useState(null);
  const [typePage, setTypePage] = useState(1);
  const [amenityPage, setAmenityPage] = useState(1);
  const typesQuery = useAdminCatalogPropertyTypes();
  const amenitiesQuery = useAdminCatalogAmenities();
  const { requestConfirm, dialogProps, isLocked, run } = useConfirmAction();

  const scheduleTypesRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["admin", "catalog", "property-types"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["catalog", "property-types"],
    });
  };

  const scheduleAmenitiesRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["admin", "catalog", "amenities"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["catalog", "amenities"],
    });
  };

  const typeRows = typesQuery.data || [];
  const amenityRows = amenitiesQuery.data || [];

  const filteredTypeRows = useMemo(
    () => filterByStatus(typeRows, statusFilter),
    [typeRows, statusFilter],
  );
  const filteredAmenityRows = useMemo(
    () => filterByStatus(amenityRows, statusFilter),
    [amenityRows, statusFilter],
  );

  useEffect(() => {
    setTypePage(1);
    setAmenityPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTypeRows.length / CATALOG_PAGE_SIZE),
    );
    if (typePage > totalPages) {
      setTypePage(totalPages);
    }
  }, [filteredTypeRows.length, typePage]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredAmenityRows.length / CATALOG_PAGE_SIZE),
    );
    if (amenityPage > totalPages) {
      setAmenityPage(totalPages);
    }
  }, [filteredAmenityRows.length, amenityPage]);

  const activeTypeCount = typeRows.filter((row) => row.isActive).length;
  const activeAmenityCount = amenityRows.filter((row) => row.isActive).length;

  const typeSlugPreview = slugifyLabel(typeForm.label);
  const duplicateTypeLabel = findDuplicateCatalogLabel(
    typeRows,
    typeForm.label,
    editingTypeId,
  );
  const duplicateTypeSlug =
    !editingTypeId &&
    findDuplicateTypeValue(typeRows, typeSlugPreview, editingTypeId);
  const typeNameConflict = duplicateTypeLabel || duplicateTypeSlug;
  const typeNameConflictMessage = duplicateTypeLabel
    ? `"${duplicateTypeLabel.label}" already uses this display name.`
    : duplicateTypeSlug
      ? `"${duplicateTypeSlug.label}" already covers this name.`
      : "";

  const duplicateAmenityLabel = findDuplicateCatalogLabel(
    amenityRows,
    amenityForm.label,
    editingAmenityId,
  );
  const amenityNameConflictMessage = duplicateAmenityLabel
    ? `"${duplicateAmenityLabel.label}" already uses this display name.`
    : "";

  const editingTypeRow = editingTypeId
    ? typeRows.find((row) => row.id === editingTypeId)
    : null;
  const editingAmenityRow = editingAmenityId
    ? amenityRows.find((row) => row.id === editingAmenityId)
    : null;
  const typeFormUnchanged = Boolean(
    editingTypeRow && catalogAdminFormMatchesRow(editingTypeRow, typeForm),
  );
  const amenityFormUnchanged = Boolean(
    editingAmenityRow &&
    catalogAdminFormMatchesRow(editingAmenityRow, amenityForm),
  );

  const submitType = async (event) => {
    event.preventDefault();

    const payload = {
      label: typeForm.label.trim(),
      sortOrder: Number(typeForm.sortOrder) || 0,
      isActive: typeForm.isActive,
    };

    if (typeNameConflict) {
      toast.error(typeNameConflictMessage);
      return;
    }

    if (typeFormUnchanged) {
      return;
    }

    if (editingTypeId) {
      const editingRow = typeRows.find((row) => row.id === editingTypeId);
      if (editingRow && PROTECTED_PROPERTY_TYPE_VALUES.has(editingRow.value)) {
        toast.error("This property type is required and cannot be edited.");
        return;
      }
    } else {
      const value = slugifyLabel(typeForm.label);
      if (!value) {
        toast.error(
          "Display name must include letters or numbers so a slug can be generated.",
        );
        return;
      }
    }

    const busyKey = editingTypeId || "new-type";
    setBusyId(busyKey);
    try {
      await run({
        message: editingTypeId
          ? "Saving property type..."
          : "Adding property type...",
        successMessage: editingTypeId
          ? "Property type updated"
          : "Property type created",
        task: async () => {
          if (editingTypeId) {
            await customInstance({
              url: `/admin/catalog/property-types/${editingTypeId}`,
              method: "PATCH",
              data: payload,
            });
          } else {
            await customInstance({
              url: "/admin/catalog/property-types",
              method: "POST",
              data: {
                ...payload,
                value: slugifyLabel(typeForm.label),
              },
            });
          }
          setTypeForm(emptyTypeForm);
          setEditingTypeId(null);
          scheduleTypesRefresh();
        },
      });
    } catch {
      // Error toast handled by run()
    } finally {
      setBusyId(null);
    }
  };

  const submitAmenity = async (event) => {
    event.preventDefault();

    const label = amenityForm.label.trim();
    const payload = {
      label,
      sortOrder: Number(amenityForm.sortOrder) || 0,
      isActive: amenityForm.isActive,
    };

    if (duplicateAmenityLabel) {
      toast.error(amenityNameConflictMessage);
      return;
    }

    if (amenityFormUnchanged) {
      return;
    }

    const busyKey = editingAmenityId || "new-amenity";
    setBusyId(busyKey);
    try {
      await run({
        message: editingAmenityId ? "Saving amenity..." : "Adding amenity...",
        successMessage: editingAmenityId
          ? "Amenity updated"
          : "Amenity created",
        task: async () => {
          if (editingAmenityId) {
            await customInstance({
              url: `/admin/catalog/amenities/${editingAmenityId}`,
              method: "PATCH",
              data: payload,
            });
          } else {
            await customInstance({
              url: "/admin/catalog/amenities",
              method: "POST",
              data: { ...payload, value: label },
            });
          }
          setAmenityForm(emptyAmenityForm);
          setEditingAmenityId(null);
          scheduleAmenitiesRefresh();
        },
      });
    } catch {
      // Error toast handled by run()
    } finally {
      setBusyId(null);
    }
  };

  const patchTypeActive = async (row, isActive) => {
    setBusyId(row.id);
    try {
      await run({
        message: isActive
          ? "Activating property type..."
          : "Deactivating property type...",
        successMessage: isActive
          ? "Property type activated"
          : "Property type deactivated",
        task: async () => {
          await customInstance({
            url: `/admin/catalog/property-types/${row.id}`,
            method: "PATCH",
            data: { isActive },
          });
          scheduleTypesRefresh();
        },
      });
    } catch {
      // Error toast handled by run()
    } finally {
      setBusyId(null);
    }
  };

  const patchAmenityActive = async (row, isActive) => {
    setBusyId(row.id);
    try {
      await run({
        message: isActive ? "Activating amenity..." : "Deactivating amenity...",
        successMessage: isActive ? "Amenity activated" : "Amenity deactivated",
        task: async () => {
          await customInstance({
            url: `/admin/catalog/amenities/${row.id}`,
            method: "PATCH",
            data: { isActive },
          });
          scheduleAmenitiesRefresh();
        },
      });
    } catch {
      // Error toast handled by run()
    } finally {
      setBusyId(null);
    }
  };

  const promptToggleTypeActive = (row) => {
    if (!row.isActive) {
      patchTypeActive(row, true);
      return;
    }

    requestConfirm({
      ...catalogItemDeactivateConfirmation(row.label, "property type"),
      targetId: row.id,
      action: {
        message: "Deactivating property type...",
        successMessage: "Property type deactivated",
        task: async () => {
          setBusyId(row.id);
          try {
            await customInstance({
              url: `/admin/catalog/property-types/${row.id}`,
              method: "PATCH",
              data: { isActive: false },
            });
            scheduleTypesRefresh();
          } finally {
            setBusyId(null);
          }
        },
      },
    });
  };

  const promptToggleAmenityActive = (row) => {
    if (!row.isActive) {
      patchAmenityActive(row, true);
      return;
    }

    requestConfirm({
      ...catalogItemDeactivateConfirmation(row.label, "amenity"),
      targetId: row.id,
      action: {
        message: "Deactivating amenity...",
        successMessage: "Amenity deactivated",
        task: async () => {
          setBusyId(row.id);
          try {
            await customInstance({
              url: `/admin/catalog/amenities/${row.id}`,
              method: "PATCH",
              data: { isActive: false },
            });
            scheduleAmenitiesRefresh();
          } finally {
            setBusyId(null);
          }
        },
      },
    });
  };

  const promptDeleteType = (row) => {
    requestConfirm({
      ...catalogItemDeleteConfirmation(row.label, "property type"),
      targetId: row.id,
      action: {
        message: "Deleting property type...",
        successMessage: "Property type deleted",
        task: async () => {
          setBusyId(row.id);
          try {
            await customInstance({
              url: `/admin/catalog/property-types/${row.id}`,
              method: "DELETE",
            });
            if (editingTypeId === row.id) {
              setEditingTypeId(null);
              setTypeForm(emptyTypeForm);
            }
            scheduleTypesRefresh();
          } finally {
            setBusyId(null);
          }
        },
      },
    });
  };

  const promptDeleteAmenity = (row) => {
    requestConfirm({
      ...catalogItemDeleteConfirmation(row.label, "amenity"),
      targetId: row.id,
      action: {
        message: "Deleting amenity...",
        successMessage: "Amenity deleted",
        task: async () => {
          setBusyId(row.id);
          try {
            await customInstance({
              url: `/admin/catalog/amenities/${row.id}`,
              method: "DELETE",
            });
            if (editingAmenityId === row.id) {
              setEditingAmenityId(null);
              setAmenityForm(emptyAmenityForm);
            }
            scheduleAmenitiesRefresh();
          } finally {
            setBusyId(null);
          }
        },
      },
    });
  };

  const typeColumns = useMemo(
    () => [
      { key: "label", label: "Display name", render: (row) => row.label },
      {
        key: "sortOrder",
        label: "Order",
        render: (row) => row.sortOrder,
      },
      {
        key: "isActive",
        label: "Status",
        render: (row) => (
          <StatusBadge domain="account" isActive={row.isActive} />
        ),
      },
    ],
    [],
  );

  const amenityColumns = useMemo(
    () => [
      { key: "label", label: "Display name", render: (row) => row.label },
      {
        key: "sortOrder",
        label: "Order",
        render: (row) => row.sortOrder,
      },
      {
        key: "isActive",
        label: "Status",
        render: (row) => (
          <StatusBadge domain="account" isActive={row.isActive} />
        ),
      },
    ],
    [],
  );

  const isLoading =
    tab === "types" ? typesQuery.isLoading : amenitiesQuery.isLoading;
  const isError = tab === "types" ? typesQuery.isError : amenitiesQuery.isError;
  const isCatalogBusy = isLocked || Boolean(busyId);

  return (
    <div className="catalog-admin" aria-busy={isCatalogBusy}>
      <div className="catalog-admin__tabs" role="tablist" aria-label="Catalog">
        <CatalogTabButton
          label="Property types"
          total={typeRows.length}
          active={activeTypeCount}
          isSelected={tab === "types"}
          onSelect={() => setTab("types")}
          disabled={isCatalogBusy}
        />
        <CatalogTabButton
          label="Amenities"
          total={amenityRows.length}
          active={activeAmenityCount}
          isSelected={tab === "amenities"}
          onSelect={() => setTab("amenities")}
          disabled={isCatalogBusy}
        />
      </div>

      <p className="text mb25">
        Active options appear on listing forms and search filters. Deactivate
        items instead of deleting when they are already used on properties.
      </p>

      {isError ? (
        <div className="alert alert-danger mb20">
          Failed to load catalog items. Please refresh the page.
        </div>
      ) : null}

      {tab === "types" ? (
        <div className="row">
          <div className="col-lg-5 mb30 mb-lg-0">
            <div className="catalog-admin__form-panel">
              <form onSubmit={submitType}>
                <h4 className="fz17 mb10">
                  {editingTypeId ? "Edit property type" : "Add property type"}
                </h4>
                <div className="mb20">
                  <label className="heading-color ff-heading fw600 mb10">
                    Display name
                  </label>
                  <input
                    className={`form-control${typeNameConflict ? " is-invalid" : ""}`}
                    value={typeForm.label}
                    onChange={(e) =>
                      setTypeForm((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    placeholder="Penthouse"
                    required
                    disabled={isCatalogBusy}
                    aria-invalid={typeNameConflict ? true : undefined}
                  />
                  {typeNameConflict ? (
                    <p className="catalog-admin__field-error">
                      {typeNameConflictMessage}
                    </p>
                  ) : null}
                  {!editingTypeId && typeSlugPreview ? (
                    <p className="catalog-admin__help">
                      Stored value (slug):{" "}
                      <span className="catalog-admin__mono">
                        {typeSlugPreview}
                      </span>
                    </p>
                  ) : null}
                  {editingTypeId && typeForm.value ? (
                    <p className="catalog-admin__help">
                      Stored value (slug):{" "}
                      <span className="catalog-admin__mono">
                        {typeForm.value}
                      </span>{" "}
                      — cannot be changed after creation.
                    </p>
                  ) : null}
                </div>
                <div className="mb20">
                  <label className="heading-color ff-heading fw600 mb10">
                    Sort order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={typeForm.sortOrder}
                    onChange={(e) =>
                      setTypeForm((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                    min={0}
                    disabled={isCatalogBusy}
                  />
                </div>
                <label className="custom_checkbox d-block mb20">
                  Active (visible on listing forms)
                  <input
                    type="checkbox"
                    checked={typeForm.isActive}
                    disabled={isCatalogBusy}
                    onChange={(e) =>
                      setTypeForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span className="checkmark" />
                </label>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="ud-btn btn-thm"
                    disabled={
                      isCatalogBusy ||
                      Boolean(typeNameConflict) ||
                      typeFormUnchanged
                    }
                    title={
                      typeFormUnchanged
                        ? "Make changes to enable save"
                        : undefined
                    }
                  >
                    {isCatalogBusy &&
                    (busyId === editingTypeId || busyId === "new-type")
                      ? "Saving..."
                      : editingTypeId
                        ? "Save changes"
                        : "Add type"}
                  </button>
                  {editingTypeId ? (
                    <button
                      type="button"
                      className="ud-btn btn-white"
                      disabled={isCatalogBusy}
                      onClick={() => {
                        setEditingTypeId(null);
                        setTypeForm(emptyTypeForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-7">
            <CatalogStatusFilterBar
              id="catalog-status-filter-types"
              statusFilter={statusFilter}
              onChange={setStatusFilter}
              disabled={isCatalogBusy}
            />
            {renderCatalogListPanel({
              isLoading,
              allRows: typeRows,
              filteredRows: filteredTypeRows,
              skeletonRows: 7,
              entityName: "property type",
              entityNamePlural: "property types",
              onClearFilter: () => setStatusFilter(""),
              page: typePage,
              pageSize: CATALOG_PAGE_SIZE,
              onPageChange: setTypePage,
              paginationItemLabel: "property types",
              paginationItemLabelSingular: "property type",
              paginationDisabled: isCatalogBusy,
              tableProps: {
                columns: typeColumns,
                busyId,
                actionsDisabled: isCatalogBusy,
                editingId: editingTypeId,
                onEdit: (row) => {
                  if (isCatalogBusy) return;
                  setEditingTypeId(row.id);
                  setTypeForm({
                    value: row.value,
                    label: row.label,
                    sortOrder: String(row.sortOrder ?? 0),
                    isActive: row.isActive,
                  });
                },
                onToggleActive: promptToggleTypeActive,
                onDelete: promptDeleteType,
              },
            })}
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-5 mb30 mb-lg-0">
            <div className="catalog-admin__form-panel">
              <form onSubmit={submitAmenity}>
                <h4 className="fz17 mb10">
                  {editingAmenityId ? "Edit amenity" : "Add amenity"}
                </h4>
                <div className="mb20">
                  <label className="heading-color ff-heading fw600 mb10">
                    Display name
                  </label>
                  <input
                    className={`form-control${duplicateAmenityLabel ? " is-invalid" : ""}`}
                    value={amenityForm.label}
                    onChange={(e) =>
                      setAmenityForm((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    placeholder="Swimming Pool"
                    required
                    disabled={isCatalogBusy}
                    aria-invalid={duplicateAmenityLabel ? true : undefined}
                  />
                  {duplicateAmenityLabel ? (
                    <p className="catalog-admin__field-error">
                      {amenityNameConflictMessage}
                    </p>
                  ) : null}
                  {editingAmenityId && amenityForm.value ? (
                    <p className="catalog-admin__help">
                      Stored value:{" "}
                      <span className="catalog-admin__mono">
                        {amenityForm.value}
                      </span>{" "}
                      — listings reference this; it does not change when you
                      edit the display name.
                    </p>
                  ) : null}
                  {!editingAmenityId ? (
                    <p className="catalog-admin__help">
                      The stored value will match the display name on create.
                    </p>
                  ) : null}
                </div>
                <div className="mb20">
                  <label className="heading-color ff-heading fw600 mb10">
                    Sort order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={amenityForm.sortOrder}
                    onChange={(e) =>
                      setAmenityForm((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                    min={0}
                    disabled={isCatalogBusy}
                  />
                </div>
                <label className="custom_checkbox d-block mb20">
                  Active (visible on listing forms)
                  <input
                    type="checkbox"
                    checked={amenityForm.isActive}
                    disabled={isCatalogBusy}
                    onChange={(e) =>
                      setAmenityForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span className="checkmark" />
                </label>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="ud-btn btn-thm"
                    disabled={
                      isCatalogBusy ||
                      Boolean(duplicateAmenityLabel) ||
                      amenityFormUnchanged
                    }
                    title={
                      amenityFormUnchanged
                        ? "Make changes to enable save"
                        : undefined
                    }
                  >
                    {isCatalogBusy &&
                    (busyId === editingAmenityId || busyId === "new-amenity")
                      ? "Saving..."
                      : editingAmenityId
                        ? "Save changes"
                        : "Add amenity"}
                  </button>
                  {editingAmenityId ? (
                    <button
                      type="button"
                      className="ud-btn btn-white"
                      disabled={isCatalogBusy}
                      onClick={() => {
                        setEditingAmenityId(null);
                        setAmenityForm(emptyAmenityForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-7">
            <CatalogStatusFilterBar
              id="catalog-status-filter-amenities"
              statusFilter={statusFilter}
              onChange={setStatusFilter}
              disabled={isCatalogBusy}
            />
            {renderCatalogListPanel({
              isLoading,
              allRows: amenityRows,
              filteredRows: filteredAmenityRows,
              skeletonRows: 8,
              entityName: "amenity",
              entityNamePlural: "amenities",
              onClearFilter: () => setStatusFilter(""),
              page: amenityPage,
              pageSize: CATALOG_PAGE_SIZE,
              onPageChange: setAmenityPage,
              paginationItemLabel: "amenities",
              paginationItemLabelSingular: "amenity",
              paginationDisabled: isCatalogBusy,
              tableProps: {
                columns: amenityColumns,
                busyId,
                actionsDisabled: isCatalogBusy,
                editingId: editingAmenityId,
                onEdit: (row) => {
                  if (isCatalogBusy) return;
                  setEditingAmenityId(row.id);
                  setAmenityForm({
                    value: row.value,
                    label: row.label,
                    sortOrder: String(row.sortOrder ?? 0),
                    isActive: row.isActive,
                  });
                },
                onToggleActive: promptToggleAmenityActive,
                onDelete: promptDeleteAmenity,
              },
            })}
          </div>
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
