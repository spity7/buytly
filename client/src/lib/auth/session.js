import { getAccessToken } from "./tokens";

export function hasActiveSession() {
  return Boolean(getAccessToken());
}
