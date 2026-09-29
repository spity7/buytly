import request from "supertest";
import { siteRequestHeaders } from "./siteFixtures.js";

export function api(app, slug) {
  const headers = siteRequestHeaders(slug);

  const withHeaders = (req) => req.set(headers);

  return {
    get: (path) => withHeaders(request(app).get(path)),
    post: (path) => withHeaders(request(app).post(path)),
    patch: (path) => withHeaders(request(app).patch(path)),
    put: (path) => withHeaders(request(app).put(path)),
    delete: (path) => withHeaders(request(app).delete(path)),
  };
}

export { request };
