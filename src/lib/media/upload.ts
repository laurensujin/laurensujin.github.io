"use client";

/**
 * Browser-side upload pipeline:
 *   1. check the file type and size
 *   2. for big images, downscale on a canvas so the site never stores a
 *      50 MB raw photo it will only ever show at 3000 px
 *   3. upload straight to Supabase Storage with a progress callback
 *   4. record the file in the media library (server action)
 */
import { registerMedia } from "@/lib/actions/media";
import { registerResume } from "@/lib/actions/resume";
import type { MediaRef } from "@/lib/content/schema";
import type { MediaItem } from "@/lib/data/types";
import { createClient } from "@/lib/supabase/browser";
import { supabaseEnv } from "@/lib/supabase/env";
import { newId } from "@/lib/utils";
import { MEDIA_BUCKET } from "./url";

/** Longest edge kept for uploaded images. Plenty for full-width retina screens. */
export const MAX_IMAGE_EDGE = 3000;
/** Supabase's per-file limit on the free plan. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const PDF_TYPES = ["application/pdf"];

export type MediaKind = "image" | "video" | "pdf";

export function kindOf(file: File): MediaKind | null {
  if (IMAGE_TYPES.includes(file.type)) return "image";
  if (VIDEO_TYPES.includes(file.type)) return "video";
  if (PDF_TYPES.includes(file.type)) return "pdf";
  return null;
}

export function acceptFor(kinds: MediaKind[]): string {
  const list: string[] = [];
  if (kinds.includes("image")) list.push(...IMAGE_TYPES);
  if (kinds.includes("video")) list.push(...VIDEO_TYPES);
  if (kinds.includes("pdf")) list.push(...PDF_TYPES);
  return list.join(",");
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
};

/** Unique, URL-safe storage path such as images/2026/09/8f1c....jpg */
export function storagePath(kind: MediaKind, mimeType: string): string {
  const now = new Date();
  const folder = kind === "image" ? "images" : kind === "video" ? "videos" : "documents";
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${folder}/${now.getFullYear()}/${month}/${newId()}.${EXT[mimeType] ?? "bin"}`;
}

function titleFromFilename(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

interface Prepared {
  blob: Blob;
  mimeType: string;
  width: number | null;
  height: number | null;
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This image could not be read."));
      img.src = URL.createObjectURL(file);
    });
  }
}

/** Measures an image and downscales it if it is larger than MAX_IMAGE_EDGE. */
export async function prepareImage(file: File): Promise<Prepared> {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return { blob: file, mimeType: file.type, width: null, height: null };
  }

  const source = await decode(file);
  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;
  const longest = Math.max(width, height);

  if (longest <= MAX_IMAGE_EDGE) {
    return { blob: file, mimeType: file.type, width, height };
  }

  const scale = MAX_IMAGE_EDGE / longest;
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, mimeType: file.type, width, height };
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  // PNG stays PNG (keeps transparency); photos become high-quality JPEG.
  const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outType, 0.92));
  if (!blob) return { blob: file, mimeType: file.type, width, height };
  return { blob, mimeType: outType, width: targetWidth, height: targetHeight };
}

async function videoDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth || null, height: video.videoHeight || null });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve({ width: null, height: null });
    video.src = URL.createObjectURL(file);
  });
}

/** Uploads a blob to the `media` bucket, reporting progress from 0 to 100. */
export async function uploadToStorage(blob: Blob, path: string, mimeType: string, onProgress?: (percent: number) => void): Promise<void> {
  const { url, key } = supabaseEnv();
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Your session has expired. Please sign in again.");

  const target = `${url}/storage/v1/object/${MEDIA_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", target);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let message = `Upload failed (${xhr.status}).`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body?.message) message = body.message;
        } catch {
          // keep the generic message
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(blob);
  });
}

export interface UploadedMedia {
  item: MediaItem;
  ref: MediaRef;
}

/** Full pipeline for an image, video or PDF chosen in the admin. */
export async function uploadMediaFile(file: File, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  const kind = kindOf(file);
  if (!kind) throw new Error(`"${file.name}" is not a supported type. Use JPG, PNG, WebP, GIF, SVG, MP4, WebM or PDF.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" is larger than 50 MB.`);

  let prepared: Prepared = { blob: file, mimeType: file.type, width: null, height: null };
  if (kind === "image") prepared = await prepareImage(file);
  if (kind === "video") prepared = { ...prepared, ...(await videoDimensions(file)) };

  const path = storagePath(kind, prepared.mimeType);
  await uploadToStorage(prepared.blob, path, prepared.mimeType, onProgress);

  const result = await registerMedia({
    path,
    kind,
    mimeType: prepared.mimeType,
    sizeBytes: prepared.blob.size,
    width: prepared.width,
    height: prepared.height,
    title: titleFromFilename(file.name),
    altText: "",
    originalFilename: file.name,
  });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

/** Resume PDFs live in their own folder and table. */
export async function uploadResumeFile(file: File, onProgress?: (percent: number) => void) {
  if (file.type !== "application/pdf") throw new Error("The resume must be a PDF file.");
  if (file.size > MAX_FILE_BYTES) throw new Error("The PDF is larger than 50 MB.");
  const path = `resume/${newId()}.pdf`;
  await uploadToStorage(file, path, "application/pdf", onProgress);
  const result = await registerResume({ path, filename: file.name, sizeBytes: file.size });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
