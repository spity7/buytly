import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDistance,
  haversineKm,
  nearbyService,
} from "../src/services/nearby.service.js";

const jsonOverpassResponse = (elements) => ({
  ok: true,
  headers: { get: () => "application/json" },
  json: async () => ({ elements }),
});

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
        vi.fn(async () =>
          jsonOverpassResponse([
            {
              lat: 25.21,
              lon: 55.27,
              tags: { amenity: "school", name: "Test School" },
            },
            {
              center: { lat: 25.22, lon: 55.28 },
              tags: { amenity: "hospital", name: "Test Hospital" },
            },
          ]),
        ),
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

    it("deduplicates places with the same name and subtitle", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          jsonOverpassResponse([
            {
              lat: 25.21,
              lon: 55.27,
              tags: { amenity: "school", name: "Test School" },
            },
            {
              lat: 25.211,
              lon: 55.271,
              tags: { amenity: "school", name: "Test School" },
            },
          ]),
        ),
      );

      const result = await nearbyService.fetchNearbyPlaces(25.2048, 55.2708);
      expect(result.categories[0].places).toHaveLength(1);
    });

    it("falls back to the next Overpass endpoint when the first fails", async () => {
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new Error("primary down"))
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => "application/json" },
          json: async () => ({
            elements: [
              {
                lat: 33.89,
                lon: 35.5,
                tags: { amenity: "school", name: "Fallback School" },
              },
            ],
          }),
        });
      vi.stubGlobal("fetch", fetchMock);

      const result = await nearbyService.fetchNearbyPlaces(33.884, 35.486);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.categories[0].places[0].name).toBe("Fallback School");
    });

    it("passes an abort timeout to Overpass fetch", async () => {
      const fetchMock = vi.fn(async (_url, _options) =>
        jsonOverpassResponse([]),
      );
      vi.stubGlobal("fetch", fetchMock);

      await nearbyService.fetchNearbyPlaces(25.2048, 55.2708);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });
});
