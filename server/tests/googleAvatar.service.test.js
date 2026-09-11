import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/services/gcs.service.js", () => ({
  gcsService: {
    uploadFile: vi.fn(),
  },
}));

const { gcsService } = await import("../src/services/gcs.service.js");
const { importAvatarFromUrl, syncGoogleAvatarIfMissing } =
  await import("../src/services/googleAvatar.service.js");

describe("googleAvatar.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gcsService.uploadFile.mockResolvedValue({
      gcsKey: "avatars/test.jpg",
      mimeType: "image/jpeg",
      size: 128,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads a fetched Google profile photo to GCS", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () =>
          Promise.resolve(Uint8Array.from([0xff, 0xd8]).buffer),
      }),
    );

    const uploaded = await importAvatarFromUrl("https://example.com/photo.jpg");

    expect(uploaded.gcsKey).toBe("avatars/test.jpg");
    expect(gcsService.uploadFile).toHaveBeenCalledOnce();
  });

  it("sets avatar on user when missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () =>
          Promise.resolve(Uint8Array.from([0xff, 0xd8]).buffer),
      }),
    );

    const user = { avatar: undefined };
    const updated = await syncGoogleAvatarIfMissing(
      user,
      "https://example.com/photo.jpg",
    );

    expect(updated).toBe(true);
    expect(user.avatar?.gcsKey).toBe("avatars/test.jpg");
  });

  it("skips sync when user already has an avatar", async () => {
    const user = { avatar: { gcsKey: "avatars/existing.jpg" } };
    const updated = await syncGoogleAvatarIfMissing(
      user,
      "https://example.com/photo.jpg",
    );

    expect(updated).toBe(false);
    expect(gcsService.uploadFile).not.toHaveBeenCalled();
  });
});
