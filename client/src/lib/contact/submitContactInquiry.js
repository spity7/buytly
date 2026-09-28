import { customInstance } from "@/lib/api/custom-instance";

/**
 * Public contact form — POST /contact
 * Regenerate Orval client with `npm run gen:api` when the OpenAPI spec changes.
 */
export function submitContactInquiry(payload) {
  return customInstance({
    url: "/contact",
    method: "POST",
    data: payload,
  });
}
