import { AsyncLocalStorage } from "node:async_hooks";
import { AppError } from "./AppError.js";

export const requestContext = new AsyncLocalStorage();

export function getRequestStore() {
  return requestContext.getStore();
}

export function getRequestSite() {
  return getRequestStore()?.site ?? null;
}

export function getRequestSiteId() {
  const site = getRequestSite();
  if (!site?._id) {
    throw new AppError("Site context is required for this operation", 500);
  }
  return site._id;
}

export function runWithRequestContext(store, callback) {
  return requestContext.run(store, callback);
}

/**
 * Multer finishes parsing on an internal async path that does not inherit
 * AsyncLocalStorage from resolveSite. Re-bind site context from req.site before
 * handlers that call getRequestSiteId() / getRequestSite().
 */
export function bindSiteContext(req, res, next) {
  const site = req.site;
  if (!site?._id) {
    return next(
      new AppError("Site context is required for this operation", 500),
    );
  }
  return runWithRequestContext({ site }, () => next());
}
