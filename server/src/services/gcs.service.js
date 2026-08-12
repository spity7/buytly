import { Storage } from "@google-cloud/storage";
import { env } from "../config/env.js";
import { AppError } from "../shared/AppError.js";
import { mimeToExtension, prepareImageBuffer } from "./image.service.js";

let storage = null;
let bucket = null;

const initGCS = () => {
  if (bucket) return bucket;

  const options = { projectId: env.GCS_PROJECT_ID };
  if (env.GCS_KEY_FILE) {
    options.keyFilename = env.GCS_KEY_FILE;
  }

  storage = new Storage(options);
  bucket = storage.bucket(env.GCS_BUCKET);
  return bucket;
};

export const gcsService = {
  async uploadFile(buffer, { folder, mimeType, originalName }) {
    const gcsBucket = initGCS();

    let uploadBuffer = buffer;
    let uploadMimeType = mimeType;

    if (mimeType?.startsWith("image/")) {
      const prepared = await prepareImageBuffer(buffer, mimeType);
      uploadBuffer = prepared.buffer;
      uploadMimeType = prepared.mimeType;
    }

    const ext =
      uploadMimeType !== mimeType
        ? mimeToExtension(uploadMimeType)
        : originalName?.split(".").pop() || mimeToExtension(uploadMimeType);

    const gcsKey = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const file = gcsBucket.file(gcsKey);

    await file.save(uploadBuffer, {
      metadata: { contentType: uploadMimeType },
      resumable: false,
    });

    return { gcsKey, mimeType: uploadMimeType, size: uploadBuffer.length };
  },

  async deleteFile(gcsKey) {
    if (!gcsKey) return;
    const gcsBucket = initGCS();
    await gcsBucket.file(gcsKey).delete({ ignoreNotFound: true });
  },

  async getSignedUrl(gcsKey, expiresInSeconds = 3600) {
    if (!gcsKey) return null;
    const gcsBucket = initGCS();
    const [url] = await gcsBucket.file(gcsKey).getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  },

  /** Plain avatar object with signed read URL (safe for JSON responses). */
  async resolveAvatar(avatar) {
    if (!avatar?.gcsKey) {
      return undefined;
    }

    return {
      gcsKey: avatar.gcsKey,
      mimeType: avatar.mimeType,
      size: avatar.size,
      url: await gcsService.getSignedUrl(avatar.gcsKey),
    };
  },

  async attachSignedUrls(items, keyField = "gcsKey", urlField = "url") {
    if (!items) return items;
    const list = Array.isArray(items) ? items : [items];

    await Promise.all(
      list.map(async (item) => {
        if (item[keyField]) {
          item[urlField] = await gcsService.getSignedUrl(item[keyField]);
        }
      }),
    );

    return items;
  },
};

export const createMulterOptions = (multer) => {
  const imageMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const videoMimes = ["video/mp4", "video/webm", "video/quicktime"];

  return {
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [...imageMimes, ...videoMimes];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError("Invalid file type", 400), false);
      }
    },
  };
};

export const avatarUpload = (multer) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new AppError("Only JPEG, PNG, and WebP images are allowed", 400),
          false,
        );
      }
    },
  });
