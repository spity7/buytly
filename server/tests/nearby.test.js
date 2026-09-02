import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDistance,
  haversineKm,
  nearbyService,
} from "../src/services/nearby.service.js";

describe("nearby.service", () => {
  describe("haversineKm", () => {
    it("returns zero for identical coordinates", () => {
      expect(haversineKm(25.2048, 55.2708, 25.2048, 55.2708)).toBe(0);
    });

    it("returns a positive distance for different coordinates", () => {
      const distance = haversineKm(25.2048, 55.2708, 25.1972, 55.2744);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2);
    });
  });

  describe("formatDistance", () => {
    it("formats sub-kilometer distances in meters", () => {
      expect(formatDistance(0.45)).toBe("450 m");
    });

    it("formats kilometer distances with one decimal", () => {
      expect(formatDistance(1.23)).toBe("1.2 km");
    });
  });

  describe("fetchNearbyPlaces", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => ({
          ok: true,
          json: async () => ({
            elements: [
              {
                lat: 25.21,
                lon: 55.27,
                tags: { amenity: "school", name: "Test School" },
              },
              {
                center: { lat: 25.22, lon: 55.28 },
                tags: { amenity: "hospital", name: "Test Hospital" },
              },
            ],
          }),
        })),
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("groups OpenStreetMap elements into nearby categories", async () => {
      const result = await nearbyService.fetchNearbyPlaces(25.2048, 55.2708);

      expect(result.source).toBe("openstreetmap");
      expect(result.categories).toHaveLength(3);
      expect(result.categories[0].places[0].name).toBe("Test School");
      expect(result.categories[1].places[0].name).toBe("Test Hospital");
    });
  });
});
