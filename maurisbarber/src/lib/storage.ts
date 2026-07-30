import { mkdir, writeFile } from "fs/promises";
import path from "path";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

interface SaveUploadOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

// Local-disk file storage for v1. Kept behind this single function so a
// future move to cloud storage (S3, Vercel Blob, etc.) only touches this
// file, not every caller.
//
// The saved extension is derived from the validated MIME type, never from
// the client-supplied filename — files land in public/uploads, which is
// served statically, so trusting an attacker-chosen name/extension (e.g.
// ".html" or ".svg") would allow stored XSS under our own origin.
export async function saveUploadedFile(
  file: File,
  subdir: string,
  options: SaveUploadOptions = {},
): Promise<string> {
  const maxSizeBytes = options.maxSizeBytes ?? 8 * 1024 * 1024;
  const allowedMimeTypes = options.allowedMimeTypes ?? Object.keys(EXTENSION_BY_MIME);

  if (file.size > maxSizeBytes) {
    throw new Error(`El archivo supera el tamaño máximo permitido (${Math.round(maxSizeBytes / 1024 / 1024)}MB)`);
  }
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido");
  }

  const ext = EXTENSION_BY_MIME[file.type] ?? "";
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${subdir}/${filename}`;
}
