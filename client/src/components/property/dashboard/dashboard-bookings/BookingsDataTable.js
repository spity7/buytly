"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import ApiPagination from "@/components/property/ApiPagination";
import { useAgentBookings, useMyBookings } from "@/hooks/useBookings";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { canManageListings } from "@/lib/auth/roles";
import {
  bookingApproveConfirmation,
  bookingCancelConfirmation,
  bookingCompleteConfirmation,
  bookingRejectConfirmation,
} from "@/lib/confirmations";
import {
  DashboardFilterBar,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import { BOOKING_STATUS_FILTERS } from "@/lib/dashboard/filterOptions";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useAuth } from "@/providers/AuthProvider";
import {
  useDashboardRowHighlight,
  useHighlightQueryParam,
} from "@/hooks/useDashboardRowHighlight";
import { useResolveDashboardHighlight } from "@/hooks/useResolveDashboardHighlight";
import { getFreshQueryOptions } from "@/lib/dashboard/freshHighlightQueryOptions";
import { invalidateNotificationQueries } from "@/lib/notifications/invalidateNotificationQueries";
import { useQueryClient } from "@tanstack/react-query";
import DashboardTableEmptyState, {
  DashboardTableErrorState,
} from "@/components/property/dashboard/DashboardTableEmptyState";
import { getBookingsEmptyState } from "@/lib/dashboard/tableEmptyStates";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getBookingConfirmConfig = (action) => {
  if (action === "cancel") return bookingCancelConfirmation();
  if (action === "rejected") return bookingRejectConfirmation();
  if (action === "approved") return bookingApproveConfirmation();
  return bookingCompleteConfirmation();
};

const getBookingActionMessage = (action) => {
  if (action === "cancel") return "Cancelling booking...";
  if (action === "approved") return "Approving booking...";
  if (action === "rejected") return "Rejecting booking...";
  if (action === "completed") return "Completing booking...";
  return "Updating booking...";
};

const getBookingSuccessMessage = (action) => {
  if (action === "cancel") return "Booking cancelled";
  if (action === "approved") return "Booking approved";
  if (action === "rejected") return "Booking rejected";
  if (action === "completed") return "Booking completed";
  return `Booking ${action}`;
};

function BookingRows({
  bookings,
  mode,
  onAction,
  actingId,
  tableBusy,
  getRowProps,
}) {
  return bookings.map((booking) => {
    const property = booking.propertyId;
    const rowBusy = actingId === booking._id;

    return (
      <tr key={booking._id} {...getRowProps(booking._id)}>
        <th scope="row">
          <Link
            href={`/single-v1/${property?._id}`}
            className={tableBusy ? "pe-none opacity-50" : undefined}
            aria-disabled={tableBusy}
            tabIndex={tableBusy ? -1 : undefined}
          >
            {property?.title || "Property"}
          </Link>
        </th>
        <td className="vam">{formatDate(booking.scheduledAt)}</td>
        <td className="vam">
          <StatusBadge domain="booking" status={booking.status} />
        </td>
        <td className="vam">{booking.message || "—"}</td>
        <td className="vam">
          {mode === "buyer" && booking.status === "pending" && (
            <button
              type="button"
              className="ud-btn btn-white btn-sm"
              disabled={rowBusy || tableBusy}
              onClick={() => onAction(booking._id, "cancel")}
            >
              Cancel
            </button>
          )}
          {mode === "agent" && booking.status === "pending" && (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="ud-btn btn-thm btn-sm"
                disabled={rowBusy || tableBusy}
                onClick={() => onAction(booking._id, "approved")}
              >
                Approve
              </button>
              <button
                type="button"
                className="ud-btn btn-white btn-sm"
                disabled={rowBusy || tableBusy}
                onClick={() => onAction(booking._id, "rejected")}
              >
                Reject
              </button>
            </div>
          )}
          {mode === "agent" && booking.status === "approved" && (
            <button
              type="button"
              className="ud-btn btn-thm btn-sm"
              disabled={rowBusy || tableBusy}
              onClick={() => onAction(booking._id, "completed")}
            >
              Mark completed
            </button>
          )}
        </td>
      </tr>
    );
  });
}

const PAGE_SIZE = 20;

export default function BookingsDataTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showAgentTab = canManageListings(user?.role);
  const [tab, setTab] = useState(showAgentTab ? "agent" : "buyer");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { requestConfirm, isLocked, dialogProps, pending } =
    useConfirmAction();

  const bookingParams = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
  };
  const highlightId = useHighlightQueryParam();
  const freshQueryOptions = getFreshQueryOptions(highlightId);

  const buyerQuery = useMyBookings(bookingParams, {
    ...freshQueryOptions,
    enabled: tab === "buyer" || Boolean(highlightId),
  });
  const agentQuery = useAgentBookings(bookingParams, {
    ...freshQueryOptions,
    enabled: (tab === "agent" && showAgentTab) || Boolean(highlightId),
  });

  const activeQuery = tab === "agent" ? agentQuery : buyerQuery;
  const bookings = activeQuery.data?.bookings || [];
  const pagination = activeQuery.data?.pagination;

  const resolveHighlight = useCallback(
    async ({ highlightId: id, findPage }) => {
      setStatusFilter("");

      const buyerPage = await findPage(async (scanPage) => {
        const response = await buytlyApi.getMyBookings({
          page: scanPage,
          limit: PAGE_SIZE,
        });
        return {
          items: response.data,
          pagination: response.pagination,
        };
      });

      if (buyerPage) {
        setTab("buyer");
        setPage(buyerPage);
        return;
      }

      if (showAgentTab) {
        const agentPage = await findPage(async (scanPage) => {
          const response = await buytlyApi.getAgentBookings({
            page: scanPage,
            limit: PAGE_SIZE,
          });
          return {
            items: response.data,
            pagination: response.pagination,
          };
        });

        if (agentPage) {
          setTab("agent");
          setPage(agentPage);
        }
      }
    },
    [showAgentTab],
  );

  const highlightResolving = useResolveDashboardHighlight({
    highlightId,
    items: bookings,
    isLoading: activeQuery.isLoading,
    resolve: resolveHighlight,
  });

  useEffect(() => {
    if (!highlightId || buyerQuery.isLoading || agentQuery.isLoading) {
      return;
    }

    const inAgent = agentQuery.data?.bookings?.some(
      (booking) => String(booking._id) === String(highlightId),
    );
    const inBuyer = buyerQuery.data?.bookings?.some(
      (booking) => String(booking._id) === String(highlightId),
    );

    if (inAgent && showAgentTab && tab !== "agent") {
      setTab("agent");
    } else if (inBuyer && tab !== "buyer") {
      setTab("buyer");
    }
  }, [
    highlightId,
    buyerQuery.data,
    buyerQuery.isLoading,
    agentQuery.data,
    agentQuery.isLoading,
    showAgentTab,
    tab,
  ]);

  const highlightReady =
    !activeQuery.isLoading &&
    !highlightResolving &&
    (!highlightId ||
      bookings.some((booking) => String(booking._id) === String(highlightId)));

  const { getRowProps } = useDashboardRowHighlight({
    highlightId,
    ready: highlightReady,
  });

  const invalidateBookings = () => {
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["agent-bookings"] });
    invalidateNotificationQueries(queryClient);
  };

  const promptAction = (bookingId, action) => {
    requestConfirm({
      ...getBookingConfirmConfig(action),
      targetId: bookingId,
      action: {
        message: getBookingActionMessage(action),
        successMessage: getBookingSuccessMessage(action),
        task: async () => {
          if (action === "cancel") {
            await buytlyApi.cancelBooking(bookingId);
          } else {
            await buytlyApi.updateBookingStatus(bookingId, { status: action });
          }
        },
        onSuccess: invalidateBookings,
      },
    });
  };

  const tableBusy = isLocked;
  const actingId = pending?.targetId ?? null;
  const hasActiveFilters = Boolean(statusFilter);
  const clearFilters = () => {
    setStatusFilter("");
    setPage(1);
  };
  const emptyState = getBookingsEmptyState({
    mode: tab === "agent" ? "agent" : "buyer",
    hasActiveFilters,
    onClearFilters: clearFilters,
  });

  return (
    <>
      {showAgentTab && (
        <div className="mb20 d-flex gap-2">
          <button
            type="button"
            className={`ud-btn btn-sm ${tab === "agent" ? "btn-thm" : "btn-white"}`}
            disabled={tableBusy}
            onClick={() => {
              setTab("agent");
              setPage(1);
            }}
          >
            Incoming requests
          </button>
          <button
            type="button"
            className={`ud-btn btn-sm ${tab === "buyer" ? "btn-thm" : "btn-white"}`}
            disabled={tableBusy}
            onClick={() => {
              setTab("buyer");
              setPage(1);
            }}
          >
            My visits
          </button>
        </div>
      )}

      <DashboardFilterBar className="mb20">
        <FilterSelect
          id="booking-status-filter"
          label="Status"
          hideLabel
          value={statusFilter}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={BOOKING_STATUS_FILTERS}
        />
      </DashboardFilterBar>

      {activeQuery.isLoading || highlightResolving ? (
        <DashboardTableSkeleton rows={4} columns={5} />
      ) : activeQuery.isError ? (
        <DashboardTableErrorState
          title="Could not load bookings"
          onRetry={() => {
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["agent-bookings"] });
          }}
        />
      ) : !bookings.length ? (
        <DashboardTableEmptyState {...emptyState} />
      ) : (
        <table className="table-style3 table at-savesearch">
          <thead className="t-head">
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Scheduled</th>
              <th scope="col">Status</th>
              <th scope="col">Message</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="t-body">
            <BookingRows
              bookings={bookings}
              mode={tab === "agent" ? "agent" : "buyer"}
              onAction={promptAction}
              actingId={actingId}
              tableBusy={tableBusy}
              getRowProps={getRowProps}
            />
          </tbody>
        </table>
      )}

      {!activeQuery.isLoading && !highlightResolving && (
        <div className="mt30">
          <ApiPagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total || 0}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
