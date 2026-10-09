"use client";

import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import {
  formatMemberSince,
  formatUserDisplayName,
  formatUserRole,
} from "@/lib/user/formatUserMeta";
import { DashboardInlineStatsSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";

const AccountSummary = () => {
  const { user } = useAuth();
  const [agentStats, setAgentStats] = useState(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [agentError, setAgentError] = useState("");

  const loadAgentStats = useCallback(async () => {
    if (!user || user.role !== "agent") {
      return;
    }

    setIsLoadingAgent(true);
    setAgentError("");

    try {
      const response = await buytlyApi.getMyAgentProfile();
      const profile = response.data?.profile;
      setAgentStats({
        isVerified: profile?.isVerified ?? false,
        rating: profile?.rating ?? 0,
        reviewCount: profile?.reviewCount ?? 0,
        listingsCount: response.data?.listingsCount ?? 0,
      });
    } catch (err) {
      setAgentError(getApiError(err));
      setAgentStats(null);
    } finally {
      setIsLoadingAgent(false);
    }
  }, [user]);

  useEffect(() => {
    loadAgentStats();
  }, [loadAgentStats]);

  if (!user) {
    return null;
  }

  const memberSince = formatMemberSince(user.createdAt);

  return (
    <div className="account-summary mb25">
      <h5 className="account-summary__name">{formatUserDisplayName(user)}</h5>
      <div className="account-summary__meta">
        <span className="account-summary__badge">
          {formatUserRole(user.role)}
        </span>
        {memberSince ? (
          <span className="account-summary__text">
            Member since {memberSince}
          </span>
        ) : null}
      </div>

      {user.role === "agent" ? (
        <div className="account-summary__agent-stats">
          {isLoadingAgent ? (
            <DashboardInlineStatsSkeleton />
          ) : agentError ? (
            <div className="d-flex flex-wrap align-items-center gap-2">
              <p className="text-danger fz13 mb0">{agentError}</p>
              <button
                type="button"
                className="account-summary__retry"
                onClick={loadAgentStats}
              >
                Retry
              </button>
            </div>
          ) : agentStats ? (
            <ul className="account-summary__stats-list mb0">
              <li>
                <span className="account-summary__stat-label">Verified</span>
                <span className="account-summary__stat-value">
                  {agentStats.isVerified ? "Yes" : "Pending"}
                </span>
              </li>
              <li>
                <span className="account-summary__stat-label">Rating</span>
                <span className="account-summary__stat-value">
                  {agentStats.rating.toFixed(1)} ({agentStats.reviewCount}{" "}
                  reviews)
                </span>
              </li>
              <li>
                <span className="account-summary__stat-label">
                  Active listings
                </span>
                <span className="account-summary__stat-value">
                  {agentStats.listingsCount}
                </span>
              </li>
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AccountSummary;
