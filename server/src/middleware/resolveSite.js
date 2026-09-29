import { siteService } from "../modules/sites/site.service.js";
import { AppError } from "../shared/AppError.js";
import { runWithRequestContext } from "../shared/requestContext.js";

const SITE_OPTIONAL_PATHS = [
  "/api/v1/health",
  "/api/docs",
  "/api/docs.json",
];

function isSiteOptionalPath(req) {
  const path = req.path || req.url?.split("?")[0];
  return SITE_OPTIONAL_PATHS.some((prefix) => path?.startsWith(prefix));
}

export const resolveSite = async (req, res, next) => {
  if (isSiteOptionalPath(req)) {
    return next();
  }

  try {
    const site = await siteService.resolveFromRequest(req);
    req.site = site;
    runWithRequestContext({ site }, () => next());
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 400) {
      return next(error);
    }
    next(error);
  }
};

export const requirePlatformSite = (req, res, next) => {
  if (req.site?.kind !== "platform") {
    return next(new AppError("This endpoint is only available on the platform site", 403));
  }
  next();
};
