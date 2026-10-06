import { BRAND_NAME } from "@/data/brandAssets";

export const SITE_NAME = BRAND_NAME;

/** Homepage tab: site name only (no `| Block 57` suffix). */
export function homePageMetadata(extra = {}) {
  return {
    ...extra,
    title: { absolute: SITE_NAME },
  };
}

/** Inner pages: root layout `title.template` appends `| ${SITE_NAME}`. */
export function pageMetadata(title, extra = {}) {
  const segment = String(title ?? "").trim();
  return {
    ...extra,
    ...(segment ? { title: segment } : {}),
  };
}
