import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mongoAvailable } from "./setup.js";
import { runWithTestSite } from "./helpers/runWithTestSite.js";

vi.mock("../src/services/gcs.service.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    gcsService: {
      ...actual.gcsService,
      uploadFile: vi.fn(),
    },
  };
});

const { gcsService } = await import("../src/services/gcs.service.js");
const { importAvatarFromUrl, syncGoogleAvatarIfMissing } =
  await import("../src/services/googleAvatar.service.js");

describe.skipIf(!mongoAvailable)("googleAvatar.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gcsService.uploadFile.mockResolvedValue({
      gcsKey: "sites/buytly/avatars/test.jpg",
      mimeType: "image/jpeg",
      size: 128,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads a fetched Google profile photo to GCS under the site folder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: () =>
          Promise.resolve(Uint8Array.from([0xff, 0xd8]).buffer),
      }),
    );

    const uploaded = await runWithTestSite(() =>
      importAvatarFromUrl("https://example.com/photo.jpg"),
    );

    expect(uploaded.gcsKey).toBe("sites/buytly/avatars/test.jpg");
    expect(gcsService.uploadFile).toHaveBeenCalledOnce();
    expect(gcsService.uploadFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({ folder: "sites/buytly/avatars" }),
    );
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
    const updated = await runWithTestSite(() =>
      syncGoogleAvatarIfMissing(user, "https://example.com/photo.jpg"),
    );

    expect(updated).toBe(true);
    expect(user.avatar?.gcsKey).toBe("sites/buytly/avatars/test.jpg");
  });

  it("skips sync when user already has an avatar", async () => {
    const user = { avatar: { gcsKey: "sites/buytly/avatars/existing.jpg" } };
    const updated = await runWithTestSite(() =>
      syncGoogleAvatarIfMissing(user, "https://example.com/photo.jpg"),
    );

    expect(updated).toBe(false);
    expect(gcsService.uploadFile).not.toHaveBeenCalled();
  });
});
