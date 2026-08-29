"use client";

import Link from "next/link";
import React, { useCallback, useState } from "react";
import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ApiPagination from "@/components/property/ApiPagination";
import { useMyTransactions } from "@/hooks/useTransactions";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { formatPrice } from "@/lib/properties/formatPrice";
import {
  transactionApproveConfirmation,
  transactionCancelConfirmation,
  transactionCompleteConfirmation,
} from "@/lib/confirmations";
import {
  DashboardFilterBar,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import {
  TRANSACTION_STATUS_FILTERS,
  TRANSACTION_TYPE_FILTERS,
} from "@/lib/dashboard/filterOptions";
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

const PAGE_SIZE = 20;

export default function TransactionsDataTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const { requestConfirm, isLocked, overlayMessage, dialogProps, pending } =
    useConfirmAction({ overlay: true });

  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
  };

  const highlightId = useHighlightQueryParam();
  const { data, isLoading, isError } = useMyTransactions(
    queryParams,
    getFreshQueryOptions(highlightId),
  );
  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  const resolveHighlight = useCallback(
    async ({ highlightId: id, findPage }) => {
      try {
        await buytlyApi.getTransactionById(id);
      } catch {
        return false;
      }

      setStatusFilter("");
      setTypeFilter("");

      const foundPage = await findPage(async (scanPage) => {
        const response = await buytlyApi.getMyTransactions({
          page: scanPage,
          limit: PAGE_SIZE,
        });
        return {
          items: response.data,
          pagination: response.pagination,
        };
      });

      setPage(foundPage || 1);
    },
    [],
  );

  const highlightResolving = useResolveDashboardHighlight({
    highlightId,
    items: transactions,
    isLoading,
    resolve: resolveHighlight,
  });

  const highlightReady =
    !isLoading &&
    !highlightResolving &&
    (!highlightId ||
      transactions.some(
        (transaction) => String(transaction._id) === String(highlightId),
      ));
  const { getRowProps } = useDashboardRowHighlight({
    highlightId,
    ready: highlightReady,
  });

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
    invalidateNotificationQueries(queryClient);
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
  const showTableSkeleton = isLoading || highlightResolving;

  if (showTableSkeleton) {
    return <DashboardTableSkeleton rows={4} columns={6} />;
  }

  if (isError) {
    return <p className="text-danger">Failed to load transactions.</p>;
  }

  return (
    <>
      <DashboardFilterBar className="mb20">
        <FilterSelect
          id="transaction-status-filter"
          label="Status"
          hideLabel
          value={statusFilter}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={TRANSACTION_STATUS_FILTERS}
        />
        <FilterSelect
          id="transaction-type-filter"
          label="Type"
          hideLabel
          value={typeFilter}
          disabled={tableBusy}
          onChange={(value) => {
            setPage(1);
            setTypeFilter(value);
          }}
          options={TRANSACTION_TYPE_FILTERS}
        />
      </DashboardFilterBar>

      {!transactions.length ? (
        <p className="p-4 mb0">No transactions match your filters.</p>
      ) : (
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
                <tr key={transaction._id} {...getRowProps(transaction._id)}>
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
      )}

      <div className="mt30">
        <ApiPagination
          page={page}
          totalPages={pagination?.totalPages || 1}
          total={pagination?.total || 0}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </>
  );
}
