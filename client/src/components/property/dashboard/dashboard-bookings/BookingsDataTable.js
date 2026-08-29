"use client";

import Link from "next/link";
import React, { useState } from "react";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useAgentBookings, useMyBookings } from "@/hooks/useBookings";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { canManageListings } from "@/lib/auth/roles";
import {
  bookingApproveConfirmation,
  bookingCancelConfirmation,
  bookingCompleteConfirmation,
  bookingRejectConfirmation,
} from "@/lib/confirmations";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

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

function BookingRows({ bookings, mode, onAction, actingId, tableBusy }) {
  if (!bookings.length) {
    return (
      <tr>
        <td colSpan={5} className="p-4">
          No bookings found.
        </td>
      </tr>
    );
  }

  return bookings.map((booking) => {
    const property = booking.propertyId;
    const rowBusy = actingId === booking._id;

    return (
      <tr key={booking._id}>
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
        <td className="vam text-capitalize">{booking.status}</td>
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

export default function BookingsDataTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showAgentTab = canManageListings(user?.role);
  const [tab, setTab] = useState(showAgentTab ? "agent" : "buyer");
  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const buyerQuery = useMyBookings({}, { enabled: tab === "buyer" });
  const agentQuery = useAgentBookings(
    {},
    { enabled: tab === "agent" && showAgentTab },
  );

  const activeQuery = tab === "agent" ? agentQuery : buyerQuery;
  const bookings = activeQuery.data?.bookings || [];

  const invalidateBookings = () => {
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["agent-bookings"] });
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

  return (
    <>
      {showAgentTab && (
        <div className="mb20 d-flex gap-2">
          <button
            type="button"
            className={`ud-btn btn-sm ${tab === "agent" ? "btn-thm" : "btn-white"}`}
            disabled={tableBusy}
            onClick={() => setTab("agent")}
          >
            Incoming requests
          </button>
          <button
            type="button"
            className={`ud-btn btn-sm ${tab === "buyer" ? "btn-thm" : "btn-white"}`}
            disabled={tableBusy}
            onClick={() => setTab("buyer")}
          >
            My visits
          </button>
        </div>
      )}

      {activeQuery.isLoading ? (
        <DashboardTableSkeleton rows={4} columns={5} />
      ) : activeQuery.isError ? (
        <p className="text-danger">Failed to load bookings.</p>
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
            />
          </tbody>
        </table>
      )}

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
}
