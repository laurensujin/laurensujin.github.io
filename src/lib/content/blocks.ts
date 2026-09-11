/**
 * Metadata for every case-study block type: how it is labelled in the admin
 * "Add section" menu, and how a brand-new empty block looks.
 */
import { newId } from "@/lib/utils";
import type { Block, BlockType, ImageItem } from "./schema";

export type BlockGroup = "Images" | "Text" | "Structure";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  group: BlockGroup;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  { type: "image_large", label: "Large image", description: "One image at content width.", group: "Images" },
  { type: "image_full", label: "Full-width image", description: "One image edge to edge.", group: "Images" },
  { type: "image_two_column", label: "Two-column images", description: "Two images side by side.", group: "Images" },
  { type: "image_grid", label: "Image grid", description: "Uniform grid, 2 to 4 columns.", group: "Images" },
  { type: "moodboard", label: "Moodboard grid", description: "Pinterest-style grid of references.", group: "Images" },
  { type: "image_sequence", label: "Image sequence", description: "Labelled steps, e.g. Reference → Final.", group: "Images" },
  { type: "before_after", label: "Before / After slider", description: "Compare two images with a slider.", group: "Images" },
  { type: "video", label: "Video", description: "Uploaded video or YouTube / Vimeo link.", group: "Images" },
  { type: "heading", label: "Heading", description: "Section title with optional number.", group: "Text" },
  { type: "paragraph", label: "Paragraph", description: "Body text. Blank lines start new paragraphs.", group: "Text" },
  { type: "quote", label: "Pull quote", description: "Large statement in serif type.", group: "Text" },
  { type: "caption", label: "Caption", description: "Small supporting note.", group: "Text" },
  { type: "stats", label: "Statistics", description: "Numbers with labels.", group: "Structure" },
  { type: "timeline", label: "Timeline", description: "Days or phases with bullet lists.", group: "Structure" },
  { type: "process", label: "Process steps", description: "Numbered steps with descriptions.", group: "Structure" },
  { type: "fragrance", label: "Fragrance profile", description: "Name, story, notes and prototype imagery.", group: "Structure" },
  { type: "role_tools", label: "Role & tools", description: "Metadata list of your role and tools.", group: "Structure" },
  { type: "link", label: "Link / button", description: "External link such as Instagram or a live site.", group: "Structure" },
  { type: "spacer", label: "Spacer", description: "Vertical breathing room.", group: "Structure" },
];

export function blockLabel(type: BlockType): string {
  return BLOCK_DEFINITIONS.find((d) => d.type === type)?.label ?? type;
}

export function newImageItem(partial: Partial<ImageItem> = {}): ImageItem {
  return { id: newId(), media: null, caption: "", tag: "", ...partial };
}

/** Returns an empty block of the given type with sensible defaults. */
export function createBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case "image_large":
      return { id, type, media: null, caption: "", tag: "" };
    case "image_full":
      return { id, type, media: null, caption: "", tag: "" };
    case "image_two_column":
      return { id, type, images: [newImageItem(), newImageItem()] };
    case "image_grid":
      return { id, type, images: [], columns: 3, aspect: "natural", caption: "" };
    case "moodboard":
      return { id, type, images: [], columns: 4, caption: "" };
    case "image_sequence":
      return {
        id,
        type,
        steps: [
          { id: newId(), label: "Reference", media: null, caption: "" },
          { id: newId(), label: "Final image", media: null, caption: "" },
        ],
        caption: "",
      };
    case "before_after":
      return { id, type, before: null, after: null, beforeLabel: "Before", afterLabel: "After", caption: "" };
    case "video":
      return { id, type, media: null, url: "", poster: null, autoplay: true, loop: true, caption: "" };
    case "heading":
      return { id, type, eyebrow: "", text: "", level: 2 };
    case "paragraph":
      return { id, type, text: "", style: "body", columns: 1 };
    case "quote":
      return { id, type, text: "", attribution: "" };
    case "stats":
      return {
        id,
        type,
        items: [
          { id: newId(), value: "", label: "" },
          { id: newId(), value: "", label: "" },
          { id: newId(), value: "", label: "" },
        ],
        note: "",
      };
    case "timeline":
      return { id, type, items: [{ id: newId(), label: "", title: "", items: [] }], note: "" };
    case "process":
      return { id, type, steps: [{ id: newId(), title: "", description: "" }] };
    case "fragrance":
      return {
        id,
        type,
        name: "",
        status: "",
        story: "",
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        referenceImages: [],
        prototypeImage: null,
        prototypeCaption: "",
        notes: "",
      };
    case "link":
      return { id, type, label: "", url: "", style: "button", description: "" };
    case "role_tools":
      return { id, type, role: [], tools: [], rows: [] };
    case "caption":
      return { id, type, text: "" };
    case "spacer":
      return { id, type, size: "md" };
  }
}

/** Collects every media id referenced anywhere in a block list. */
export function collectMediaIds(blocks: Block[]): Set<string> {
  const ids = new Set<string>();
  const add = (ref: { id: string } | null | undefined) => {
    if (ref?.id) ids.add(ref.id);
  };
  for (const block of blocks) {
    switch (block.type) {
      case "image_large":
      case "image_full":
        add(block.media);
        break;
      case "image_two_column":
      case "image_grid":
      case "moodboard":
        block.images.forEach((i) => add(i.media));
        break;
      case "image_sequence":
        block.steps.forEach((s) => add(s.media));
        break;
      case "before_after":
        add(block.before);
        add(block.after);
        break;
      case "video":
        add(block.media);
        add(block.poster);
        break;
      case "fragrance":
        block.referenceImages.forEach((i) => add(i.media));
        add(block.prototypeImage);
        break;
      default:
        break;
    }
  }
  return ids;
}
