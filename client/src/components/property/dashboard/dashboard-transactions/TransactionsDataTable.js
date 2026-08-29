"use client";

import Link from "next/link";
import React, { useState } from "react";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useMyTransactions } from "@/hooks/useTransactions";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { formatPrice } from "@/lib/properties/formatPrice";
import {
  transactionApproveConfirmation,
  transactionCancelConfirmation,
  transactionCompleteConfirmation,
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
  }).format(new Date(value));
};

const getTransactionConfirmConfig = (status) => {
  if (status === "approved") return transactionApproveConfirmation();
  if (status === "cancelled") return transactionCancelConfirmation();
  return transactionCompleteConfirmation();
};

const getTransactionActionMessage = (status) => {
  if (status === "approved") return "Approving transaction...";
  if (status === "cancelled") return "Cancelling transaction...";
  if (status === "completed") return "Completing transaction...";
  return "Updating transaction...";
};

const getTransactionSuccessMessage = (status) => {
  if (status === "approved") return "Transaction approved";
  if (status === "cancelled") return "Transaction cancelled";
  if (status === "completed") return "Transaction completed";
  return `Transaction ${status}`;
};

export default function TransactionsDataTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const { data, isLoading, isError } = useMyTransactions({ limit: 50 });
  const transactions = data?.transactions || [];

  const canManageTxn = (transaction) => {
    const userId = user?.id || user?._id;
    if (!userId) return false;
    if (user?.role === "admin") return true;
    const sellerId = transaction.sellerId?._id || transaction.sellerId;
    const agentId = transaction.agentId?._id || transaction.agentId;
    return (
      String(sellerId) === String(userId) || String(agentId) === String(userId)
    );
  };

  const invalidateTransactions = () => {
    queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
  };

  const promptStatus = (transactionId, status) => {
    requestConfirm({
      ...getTransactionConfirmConfig(status),
      targetId: transactionId,
      action: {
        message: getTransactionActionMessage(status),
        successMessage: getTransactionSuccessMessage(status),
        task: () =>
          buytlyApi.updateTransactionStatus(transactionId, { status }),
        onSuccess: invalidateTransactions,
      },
    });
  };

  const tableBusy = isLocked;
  const actingId = pending?.targetId ?? null;

  if (isLoading) {
    return <DashboardTableSkeleton rows={4} columns={6} />;
  }

  if (isError) {
    return <p className="text-danger">Failed to load transactions.</p>;
  }

  if (!transactions.length) {
    return <p className="p-4 mb0">No transactions yet.</p>;
  }

  return (
    <>
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th scope="col">Property</th>
            <th scope="col">Type</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {transactions.map((transaction) => {
            const property = transaction.propertyId;
            const rowBusy = actingId === transaction._id;
            const manageable = canManageTxn(transaction);
            const isPending = transaction.status === "pending";

            return (
              <tr key={transaction._id}>
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
                <td className="vam text-capitalize">{transaction.type}</td>
                <td className="vam">
                  {formatPrice(transaction.amount, transaction.currency)}
                </td>
                <td className="vam text-capitalize">{transaction.status}</td>
                <td className="vam">{formatDate(transaction.createdAt)}</td>
                <td className="vam">
                  {manageable && isPending && (
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="ud-btn btn-thm btn-sm"
                        disabled={rowBusy || tableBusy}
                        onClick={() =>
                          promptStatus(transaction._id, "approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="ud-btn btn-white btn-sm"
                        disabled={rowBusy || tableBusy}
                        onClick={() =>
                          promptStatus(transaction._id, "cancelled")
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {manageable && transaction.status === "approved" && (
                    <button
                      type="button"
                      className="ud-btn btn-thm btn-sm"
                      disabled={rowBusy || tableBusy}
                      onClick={() =>
                        promptStatus(transaction._id, "completed")
                      }
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
}
