import sharp from "sharp";

export const IMAGE_MAX_BYTES = 800 * 1024;
export const IMAGE_MIN_TARGET_BYTES = 400 * 1024;
export const IMAGE_DEFAULT_MAX_DIMENSION = 2048;
export const IMAGE_MIN_DIMENSION = 256;

const COMPRESSIBLE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const mimeToExtension = (mimeType) => {
  switch (mimeType) {
    case "image/webp":
      return "webp";
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    default:
      return "bin";
  }
};

async function findBestQualityBuffer(pipeline, maxBytes) {
  let low = 30;
  let high = 90;
  let best = null;

  while (low <= high) {
    const quality = Math.floor((low + high) / 2);
    const candidate = await pipeline.clone().webp({ quality }).toBuffer();

    if (candidate.length <= maxBytes) {
      best = candidate;
      low = quality + 1;
    } else {
      high = quality - 1;
    }
  }

  return best;
}

/**
 * Compresses images above 800 KB down to at most 800 KB (WebP).
 * Images at or below 800 KB are returned unchanged.
 */
export async function prepareImageBuffer(
  buffer,
  mimeType,
  { maxDimension = IMAGE_DEFAULT_MAX_DIMENSION } = {},
) {
  if (!COMPRESSIBLE_MIMES.has(mimeType)) {
    return { buffer, mimeType };
  }

  if (buffer.length <= IMAGE_MAX_BYTES) {
    return { buffer, mimeType };
  }

  let dimension = maxDimension;
  let best = null;

  while (dimension >= IMAGE_MIN_DIMENSION) {
    const pipeline = sharp(buffer).rotate().resize({
      width: dimension,
      height: dimension,
      fit: "inside",
      withoutEnlargement: true,
    });

    best = await findBestQualityBuffer(pipeline, IMAGE_MAX_BYTES);

    if (best) {
      break;
    }

    dimension = Math.floor(dimension * 0.75);
  }

  if (!best) {
    best = await sharp(buffer)
      .rotate()
      .resize({
        width: IMAGE_MIN_DIMENSION,
        height: IMAGE_MIN_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 30 })
      .toBuffer();
  }

  return { buffer: best, mimeType: "image/webp" };
}

export { mimeToExtension };
