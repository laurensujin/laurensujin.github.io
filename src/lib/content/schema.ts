/**
 * Content model for projects (case studies).
 *
 * Everything a project shows on the public site lives in one JSON document
 * (`ProjectContent`) that is stored twice: as the draft you edit in /admin and
 * as the live version visitors see. This file defines that shape with zod so
 * data coming out of the database is always validated and filled with safe
 * defaults, even if a field was added after the row was written.
 *
 * Every `.catch(...)` means "if this value is missing or malformed, use the
 * fallback instead of failing" - the site should never crash on old content.
 */
import { z } from "zod";
import { newId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Media references
// ---------------------------------------------------------------------------

/** A pointer to an uploaded file. `path` is relative to the `media` bucket. */
export const mediaRefSchema = z.object({
  id: z.string(),
  path: z.string(),
  kind: z.enum(["image", "video", "pdf"]).catch("image"),
  width: z.number().int().nullable().catch(null),
  height: z.number().int().nullable().catch(null),
  alt: z.string().catch(""),
  /** Widths of the resized copies made at upload time (see media/upload.ts). */
  sizes: z.array(z.number().int()).catch([]),
});
export type MediaRef = z.infer<typeof mediaRefSchema>;

const media = mediaRefSchema.nullable().catch(null);
const text = z.string().catch("");
const id = z.string().catch(() => newId());
const stringList = z.array(z.string()).catch([]);

/** One image inside a grid, moodboard, or sequence. */
export const imageItemSchema = z.object({
  id,
  media,
  caption: text,
  /** Small uppercase label, e.g. "Design Concept" or "AI-assisted". */
  tag: text,
});
export type ImageItem = z.infer<typeof imageItemSchema>;

const imageItems = z.array(imageItemSchema).catch([]);

// ---------------------------------------------------------------------------
// Content blocks
// ---------------------------------------------------------------------------

const imageLargeBlock = z.object({
  id,
  type: z.literal("image_large"),
  media,
  caption: text,
  tag: text,
});

const imageFullBlock = z.object({
  id,
  type: z.literal("image_full"),
  media,
  caption: text,
  tag: text,
});

const imageTwoColumnBlock = z.object({
  id,
  type: z.literal("image_two_column"),
  images: imageItems, // first two are shown
});

const imageGridBlock = z.object({
  id,
  type: z.literal("image_grid"),
  images: imageItems,
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).catch(3),
  /** natural keeps each image's own ratio; the others crop to a uniform grid. */
  aspect: z.enum(["natural", "square", "portrait", "landscape"]).catch("natural"),
  caption: text,
});

const moodboardBlock = z.object({
  id,
  type: z.literal("moodboard"),
  images: imageItems,
  columns: z.union([z.literal(3), z.literal(4), z.literal(5)]).catch(4),
  caption: text,
});

const sequenceStepSchema = z.object({
  id,
  label: text, // e.g. "Reference", "Initial output", "Final image"
  media,
  caption: text,
});
export type SequenceStep = z.infer<typeof sequenceStepSchema>;

const imageSequenceBlock = z.object({
  id,
  type: z.literal("image_sequence"),
  steps: z.array(sequenceStepSchema).catch([]),
  caption: text,
});

const beforeAfterBlock = z.object({
  id,
  type: z.literal("before_after"),
  before: media,
  after: media,
  beforeLabel: z.string().catch("Before"),
  afterLabel: z.string().catch("After"),
  caption: text,
});

const videoBlock = z.object({
  id,
  type: z.literal("video"),
  media, // uploaded mp4/webm
  url: text, // or an external YouTube / Vimeo link
  poster: media,
  autoplay: z.boolean().catch(true),
  loop: z.boolean().catch(true),
  caption: text,
});

const headingBlock = z.object({
  id,
  type: z.literal("heading"),
  eyebrow: text, // small label above, e.g. "01"
  text: text,
  level: z.union([z.literal(2), z.literal(3)]).catch(2),
});

const paragraphBlock = z.object({
  id,
  type: z.literal("paragraph"),
  text: text, // blank lines separate paragraphs
  style: z.enum(["body", "lead", "small"]).catch("body"),
  columns: z.union([z.literal(1), z.literal(2)]).catch(1),
});

const quoteBlock = z.object({
  id,
  type: z.literal("quote"),
  text: text,
  attribution: text,
});

const statItemSchema = z.object({ id, value: text, label: text });
export type StatItem = z.infer<typeof statItemSchema>;

const statsBlock = z.object({
  id,
  type: z.literal("stats"),
  items: z.array(statItemSchema).catch([]),
  note: text,
});

const timelineItemSchema = z.object({
  id,
  label: text, // e.g. "Day 01"
  title: text,
  items: stringList, // bullet lines
});
export type TimelineItem = z.infer<typeof timelineItemSchema>;

const timelineBlock = z.object({
  id,
  type: z.literal("timeline"),
  items: z.array(timelineItemSchema).catch([]),
  note: text,
});

const processStepSchema = z.object({ id, title: text, description: text });
export type ProcessStep = z.infer<typeof processStepSchema>;

const processBlock = z.object({
  id,
  type: z.literal("process"),
  steps: z.array(processStepSchema).catch([]),
});

const fragranceBlock = z.object({
  id,
  type: z.literal("fragrance"),
  name: text,
  status: text, // e.g. "Prototype", "Concept"
  story: text,
  topNotes: text,
  middleNotes: text,
  baseNotes: text,
  referenceImages: imageItems,
  prototypeImage: media,
  prototypeCaption: text,
  notes: text, // development notes
});

const linkBlock = z.object({
  id,
  type: z.literal("link"),
  label: text,
  url: text,
  style: z.enum(["button", "text"]).catch("button"),
  description: text,
});

const metaRowSchema = z.object({ id, label: text, value: text });
export type MetaRow = z.infer<typeof metaRowSchema>;

const roleToolsBlock = z.object({
  id,
  type: z.literal("role_tools"),
  role: stringList,
  tools: stringList,
  rows: z.array(metaRowSchema).catch([]), // extra label/value pairs
});

const captionBlock = z.object({
  id,
  type: z.literal("caption"),
  text: text,
});

const spacerBlock = z.object({
  id,
  type: z.literal("spacer"),
  size: z.enum(["sm", "md", "lg"]).catch("md"),
});

export const blockSchema = z.discriminatedUnion("type", [
  imageLargeBlock,
  imageFullBlock,
  imageTwoColumnBlock,
  imageGridBlock,
  moodboardBlock,
  imageSequenceBlock,
  beforeAfterBlock,
  videoBlock,
  headingBlock,
  paragraphBlock,
  quoteBlock,
  statsBlock,
  timelineBlock,
  processBlock,
  fragranceBlock,
  linkBlock,
  roleToolsBlock,
  captionBlock,
  spacerBlock,
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>;

/** Invalid blocks are dropped instead of breaking the whole project. */
const blocksSchema = z
  .array(z.unknown())
  .catch([])
  .transform((items) =>
    items.flatMap((item) => {
      const result = blockSchema.safeParse(item);
      return result.success ? [result.data] : [];
    }),
  );

// ---------------------------------------------------------------------------
// Project content
// ---------------------------------------------------------------------------

export const projectContentSchema = z.object({
  title: text,
  slug: text,
  subtitle: text,
  categories: stringList,
  year: text,
  dateRange: text, // e.g. "2026–Present"
  projectStatus: text, // e.g. "In Development"
  shortDescription: text,
  cover: media,
  coverVideo: media,
  tags: stringList,
  projectUrl: text,
  projectUrlLabel: text,
  socialUrl: text,
  socialLabel: text,
  role: stringList,
  tools: stringList,
  blocks: blocksSchema,
  seoTitle: text,
  seoDescription: text,
});

export type ProjectContent = z.infer<typeof projectContentSchema>;

/** Parses raw JSON from the database into a fully defaulted ProjectContent. */
export function parseProjectContent(raw: unknown): ProjectContent {
  const result = projectContentSchema.safeParse(raw ?? {});
  if (result.success) return result.data;
  // Should not happen thanks to the catch() fallbacks, but stay safe.
  return projectContentSchema.parse({});
}

export function parseMediaRef(raw: unknown): MediaRef | null {
  if (!raw) return null;
  const result = mediaRefSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export const PROJECT_STATUSES = ["draft", "published", "hidden"] as const;
export type ContentStatus = (typeof PROJECT_STATUSES)[number];
