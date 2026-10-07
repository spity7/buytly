"use client";

import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/** Prefix of every admin inquiries query (list pages, the "new" count). */
export const ADMIN_INQUIRIES_QUERY_KEY = ["admin", "inquiries"];

export const INQUIRY_STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

/** Inquire-form submissions on the current site (newest first). */
export function useAdminInquiries(params = {}, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_INQUIRIES_QUERY_KEY, params],
    queryFn: async () => {
      const response = await buytlyApi.adminListInquiries(params);
      return {
        inquiries: response.data || [],
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}

function patchInquiryStatus(data, id, status) {
  if (!data?.inquiries) return data;
  return {
    ...data,
    inquiries: data.inquiries.map((inquiry) =>
      String(inquiry._id) === String(id) ? { ...inquiry, status } : inquiry,
    ),
  };
}

/**
 * PATCH an inquiry's status. The cached lists update right away; a failure
 * restores them and shows the API error.
 */
export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      buytlyApi.adminUpdateInquiryStatus(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INQUIRIES_QUERY_KEY });
      const previous = queryClient.getQueriesData({
        queryKey: ADMIN_INQUIRIES_QUERY_KEY,
      });
      for (const [queryKey, data] of previous) {
        queryClient.setQueryData(
          queryKey,
          patchInquiryStatus(data, id, status),
        );
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      for (const [queryKey, data] of context?.previous || []) {
        queryClient.setQueryData(queryKey, data);
      }
      notifyError(getApiError(error));
    },
    onSuccess: (_response, { status }) => {
      notifySuccess(
        `Inquiry marked as ${(INQUIRY_STATUS_LABELS[status] || status).toLowerCase()}`,
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_INQUIRIES_QUERY_KEY }),
  });
}
