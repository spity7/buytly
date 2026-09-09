"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buytlyApi } from "@/api/generated";
import ApiPagination from "@/components/property/ApiPagination";
import {
  DashboardFilterBar,
  FilterSelect,
} from "@/components/property/dashboard/DashboardFilterBar";
import { DashboardTableSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { getApiError } from "@/lib/auth/getApiError";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deleted", label: "Deleted" },
];

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const queryParams = useMemo(() => {
    const params = { page, limit: PAGE_SIZE };
    if (role) params.role = role;
    if (statusFilter === "deleted") params.deleted = "true";
    else if (statusFilter === "active") {
      params.deleted = "false";
      params.isActive = "true";
    } else if (statusFilter === "inactive") {
      params.deleted = "false";
      params.isActive = "false";
    }
    return params;
  }, [page, role, statusFilter]);

  const { data, isLoading, isError, refetch } = useAdminUsers(queryParams);
  const users = data?.users || [];

  const updateStatus = async (userId, isActive) => {
    setBusyUserId(userId);
    try {
      await buytlyApi.adminUpdateUserStatus(userId, { isActive });
      toast.success(isActive ? "User activated" : "User deactivated");
      refetch();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setBusyUserId(null);
    }
  };

  const updateRole = async (userId, nextRole) => {
    setBusyUserId(userId);
    try {
      await buytlyApi.adminUpdateUserRole(userId, { role: nextRole });
      toast.success("Role updated");
      refetch();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <>
      <DashboardFilterBar className="mb20">
        <FilterSelect
          label="Role"
          value={role}
          options={ROLE_OPTIONS}
          onChange={(value) => {
            setPage(1);
            setRole(value);
          }}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        />
      </DashboardFilterBar>

      {isError && (
        <div className="alert alert-danger mb20">
          Failed to load users. Please try again.
        </div>
      )}

      {isLoading ? (
        <DashboardTableSkeleton rows={8} columns={6} withThumbnail={false} />
      ) : (
        <div className="table-responsive">
          <table className="table-style3 table">
            <thead className="t-head">
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Joined</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="t-body">
              {users.map((user) => {
                const userId = user._id || user.id;
                const name =
                  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.email;
                const isDeleted = Boolean(user.deletedAt);
                const isBusy = busyUserId === userId;

                return (
                  <tr key={userId}>
                    <th scope="row">
                      <div>{name}</div>
                      <div className="text-muted fz13">{user.email}</div>
                    </th>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.role || "buyer"}
                        disabled={isDeleted || isBusy}
                        onChange={(event) =>
                          updateRole(userId, event.target.value)
                        }
                      >
                        {ROLE_OPTIONS.filter((option) => option.value).map(
                          (option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                    <td>
                      {isDeleted ? (
                        <span className="text-danger">Deleted</span>
                      ) : user.isActive ? (
                        "Active"
                      ) : (
                        "Inactive"
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {!isDeleted ? (
                        <button
                          type="button"
                          className="ud-btn btn-white2 btn-sm"
                          disabled={isBusy}
                          onClick={() => updateStatus(userId, !user.isActive)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt20">
        <ApiPagination
          page={page}
          totalPages={data?.pagination?.totalPages || 1}
          total={data?.pagination?.total || 0}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <p className="text mt20 mb0">
        Need listing moderation?{" "}
        <Link href="/dashboard-admin-properties">Open moderation queue</Link>.
      </p>
    </>
  );
}
