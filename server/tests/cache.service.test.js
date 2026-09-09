import { describe, it, expect, vi, beforeEach } from "vitest";

const del = vi.fn();
const scan = vi.fn();

vi.mock("../src/config/redis.js", () => ({
  getRedis: vi.fn(() => ({ status: "ready", del, scan })),
}));

import {
  ANALYTICS_CACHE_KEY,
  cacheService,
} from "../src/services/cache.service.js";

describe("cache.service", () => {
  beforeEach(() => {
    del.mockReset();
    scan.mockReset();
  });

  it("invalidateAnalytics deletes the admin analytics key", async () => {
    await cacheService.invalidateAnalytics();
    expect(del).toHaveBeenCalledWith(ANALYTICS_CACHE_KEY);
  });

  it("delPattern uses SCAN instead of KEYS", async () => {
    scan
      .mockResolvedValueOnce(["1", ["properties:abc"]])
      .mockResolvedValueOnce(["0", ["properties:def"]]);

    await cacheService.delPattern("properties:*");

    expect(scan).toHaveBeenCalledWith("0", "MATCH", "properties:*", "COUNT", 100);
    expect(del).toHaveBeenNthCalledWith(1, "properties:abc");
    expect(del).toHaveBeenNthCalledWith(2, "properties:def");
  });

  it("invalidateListingCaches clears properties and analytics", async () => {
    scan.mockResolvedValue(["0", []]);

    await cacheService.invalidateListingCaches();

    expect(scan).toHaveBeenCalledWith("0", "MATCH", "properties:*", "COUNT", 100);
    expect(del).toHaveBeenCalledWith(ANALYTICS_CACHE_KEY);
  });
});
