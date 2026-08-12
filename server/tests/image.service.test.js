import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  IMAGE_MAX_BYTES,
  prepareImageBuffer,
} from "../src/services/image.service.js";

describe("image.service", () => {
  it("returns small images unchanged when at or below 800 KB", async () => {
    const smallBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .jpeg()
      .toBuffer();

    expect(smallBuffer.length).toBeLessThanOrEqual(IMAGE_MAX_BYTES);

    const result = await prepareImageBuffer(smallBuffer, "image/jpeg");

    expect(result.buffer).toBe(smallBuffer);
    expect(result.mimeType).toBe("image/jpeg");
  });

  it("compresses large images to at most 800 KB as WebP", async () => {
    const width = 1600;
    const height = 1600;
    const raw = Buffer.alloc(width * height * 3);
    for (let i = 0; i < raw.length; i += 1) {
      raw[i] = (i * 17) % 256;
    }

    const largeBuffer = await sharp(raw, {
      raw: { width, height, channels: 3 },
    })
      .jpeg({ quality: 100 })
      .toBuffer();

    expect(largeBuffer.length).toBeGreaterThan(IMAGE_MAX_BYTES);

    const result = await prepareImageBuffer(largeBuffer, "image/jpeg");

    expect(result.buffer.length).toBeLessThanOrEqual(IMAGE_MAX_BYTES);
    expect(result.mimeType).toBe("image/webp");
    expect(result.buffer).not.toBe(largeBuffer);
  }, 15000);

  it("skips GIF images", async () => {
    const buffer = Buffer.from("GIF89a", "ascii");

    const result = await prepareImageBuffer(buffer, "image/gif");

    expect(result.buffer).toBe(buffer);
    expect(result.mimeType).toBe("image/gif");
  });
});
