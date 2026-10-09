"use client";

import ApiPagination from "@/components/property/ApiPagination";
import StatusBadge from "@/components/common/StatusBadge";
import {
  DashboardFilterBar,
  FilterClearButton,
  FilterSearch,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import DashboardTableEmptyState, {
  DashboardTableErrorState,
} from "@/components/property/dashboard/DashboardTableEmptyState";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import InquiryMessageDialog from "@/components/property/dashboard/dashboard-admin-inquiries/InquiryMessageDialog";
import {
  formatInquiryName,
  formatInquiryReceived,
  getInquiryPhoneHref,
} from "@/components/property/dashboard/dashboard-admin-inquiries/inquiryFormat";
import {
  INQUIRY_STATUS_LABELS,
  useAdminInquiries,
  useUpdateInquiryStatus,
} from "@/hooks/useAdminInquiries";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { getAdminInquiriesEmptyState } from "@/lib/dashboard/tableEmptyStates";
import { getPublicUnitHref } from "@/lib/properties/publicListingPaths";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const PAGE_SIZE = 20;
/** Longer messages are cut in the table; the full text opens in a dialog. */
const MESSAGE_PREVIEW_LENGTH = 90;

const STATUS_VALUES = Object.keys(INQUIRY_STATUS_LABELS);

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  ...STATUS_VALUES.map((value) => ({
    value,
    label: INQUIRY_STATUS_LABELS[value],
  })),
];

function getMessagePreview(message) {
  // Line breaks are kept in the dialog; the one-paragraph preview collapses them.
  const text = String(message ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= MESSAGE_PREVIEW_LENGTH) {
    return { text, truncated: false };
  }
  return {
    text: `${text.slice(0, MESSAGE_PREVIEW_LENGTH).trimEnd()}…`,
    truncated: true,
  };
}

export default function AdminInquiriesTable() {
  const [page, setPage] = useState(1);
  const resetPage = useCallback(() => setPage(1), []);
  const [searchInput, setSearchInput, search] = useDebouncedSearch(
    "",
    300,
    resetPage,
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [openInquiry, setOpenInquiry] = useState(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search ? { search } : {}),
    }),
    [page, statusFilter, search],
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useAdminInquiries(queryParams);
  const updateStatus = useUpdateInquiryStatus();
  const inquiries = data?.inquiries || [];
  const pagination = data?.pagination;
  const hasActiveFilters = Boolean(search || statusFilter);

  const resetFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
  };

  const closeDialog = useCallback(() => setOpenInquiry(null), []);

  return (
    <>
      <DashboardFilterBar className="mb20">
        <FilterSearch
          id="admin-inquiries-search"
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search inquiries"
        />
        <FilterSelect
          id="admin-inquiries-status"
          label="Status"
          value={statusFilter}
          options={STATUS_FILTERS}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        />
        <FilterClearButton visible={hasActiveFilters} onClick={resetFilters} />
      </DashboardFilterBar>

      {pagination?.total != null && !isLoading && !isError ? (
        <p className="admin-projects-moderation__summary text-muted fz14 mb20">
          {pagination.total === 1
            ? `1 inquiry ${hasActiveFilters ? "matches your filters" : "total"}`
            : `${pagination.total} inquiries ${hasActiveFilters ? "match your filters" : "total"}`}
        </p>
      ) : null}

      {isError && !inquiries.length ? (
        <DashboardTableErrorState
          title="Could not load inquiries"
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <DashboardTableSkeleton rows={6} columns={6} withThumbnail={false} />
      ) : !inquiries.length ? (
        <DashboardTableEmptyState
          {...getAdminInquiriesEmptyState({
            hasActiveFilters,
            onClearFilters: resetFilters,
          })}
        />
      ) : (
        <div
          className="table-responsive admin-inquiries"
          aria-busy={isFetching || undefined}
        >
          <table className="table-style3 table admin-inquiries-table">
            <thead className="t-head">
              <tr>
                <th scope="col">Received</th>
                <th scope="col">Name &amp; contact</th>
                <th scope="col">Residence &amp; unit</th>
                <th scope="col">Message</th>
                <th scope="col">Email delivered</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="t-body">
              {inquiries.map((inquiry) => {
                const id = inquiry._id;
                const name = formatInquiryName(inquiry);
                const received = formatInquiryReceived(inquiry.createdAt);
                const phoneHref = getInquiryPhoneHref(inquiry.phone);
                const preview = getMessagePreview(inquiry.message);
                const status = inquiry.status || "new";

                return (
                  <tr key={id}>
                    <td className="vam text-nowrap">
                      {received ? (
                        <>
                          <div>{received.date}</div>
                          <div className="text-muted fz13">{received.time}</div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <th
                      scope="row"
                      className="vam admin-inquiries-table__contact"
                    >
                      <div>{name}</div>
                      {inquiry.email ? (
                        <a
                          className="admin-inquiries-table__email"
                          href={`mailto:${inquiry.email}`}
                          title={inquiry.email}
                        >
                          {inquiry.email}
                        </a>
                      ) : null}
                      {phoneHref ? (
                        <a
                          className="admin-inquiries-table__phone"
                          href={phoneHref}
                        >
                          {inquiry.phone}
                        </a>
                      ) : null}
                    </th>
                    <td className="vam">
                      <div>{inquiry.residenceType || "—"}</div>
                      {inquiry.unitId ? (
                        <Link
                          className="fz13"
                          href={getPublicUnitHref(inquiry.unitId)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {inquiry.unitLabel || "View unit"}
                        </Link>
                      ) : inquiry.unitLabel ? (
                        <div className="fz13">{inquiry.unitLabel}</div>
                      ) : null}
                    </td>
                    <td className="vam admin-inquiries-table__message">
                      <span className="admin-inquiries-table__message-text">
                        {preview.text || "—"}
                      </span>
                      {preview.truncated ? (
                        <button
                          type="button"
                          className="admin-inquiries-table__more"
                          onClick={() => setOpenInquiry(inquiry)}
                          aria-label={`Read the full message from ${name}`}
                        >
                          Read more
                        </button>
                      ) : null}
                    </td>
                    <td className="vam">
                      {inquiry.emailDelivered ? (
                        <StatusBadge tone="success" label="Delivered" />
                      ) : (
                        <span title="The notification to the site inbox was not sent — follow up from here.">
                          <StatusBadge tone="pending" label="Not delivered" />
                        </span>
                      )}
                    </td>
                    <td className="vam">
                      <select
                        className="form-select form-select-sm admin-inquiries-table__status"
                        value={status}
                        aria-label={`Status of the inquiry from ${name}`}
                        onChange={(event) =>
                          updateStatus.mutate({
                            id,
                            status: event.target.value,
                          })
                        }
                      >
                        {STATUS_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {INQUIRY_STATUS_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError ? (
        <div className="mt30">
          <ApiPagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total || 0}
            limit={PAGE_SIZE}
            itemLabel="inquiries"
            itemLabelSingular="inquiry"
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <InquiryMessageDialog inquiry={openInquiry} onClose={closeDialog} />
    </>
  );
}
