import { isSafeUrl } from "@/lib/utils";
import type { Block } from "./schema";

/**
 * Decides whether a block has anything to show on the public site. Empty
 * blocks (an image slot with nothing uploaded yet, a paragraph with no text)
 * are skipped so a half-finished case study still looks intentional.
 */
export function isRenderable(block: Block): boolean {
  switch (block.type) {
    case "image_large":
    case "image_full":
      return Boolean(block.media);
    case "image_two_column":
    case "image_grid":
    case "moodboard":
      return block.images.some((i) => i.media);
    case "image_sequence":
      return block.steps.some((s) => s.media || s.label.trim());
    case "before_after":
      return Boolean(block.before || block.after);
    case "video":
      return Boolean(block.media || isSafeUrl(block.url));
    case "heading":
      return Boolean(block.text.trim());
    case "paragraph":
    case "quote":
    case "caption":
      return Boolean(block.text.trim());
    case "stats":
      return block.items.some((i) => i.value.trim());
    case "timeline":
      return block.items.some((i) => i.title.trim() || i.label.trim() || i.items.length);
    case "process":
      return block.steps.some((s) => s.title.trim());
    case "fragrance":
      return Boolean(block.name.trim() || block.story.trim());
    case "link":
      return Boolean(block.label.trim() && isSafeUrl(block.url));
    case "role_tools":
      return block.role.length > 0 || block.tools.length > 0 || block.rows.some((r) => r.value.trim());
    case "spacer":
      return true;
  }
}

/**
 * Filters out empty blocks, and drops a heading when the whole section under
 * it is empty (no content before the next heading).
 */
export function renderableBlocks(blocks: Block[]): Block[] {
  const kept = blocks.filter(isRenderable);
  const result: Block[] = [];
  for (let i = 0; i < kept.length; i++) {
    const block = kept[i];
    if (block.type === "heading") {
      let hasContent = false;
      for (let j = i + 1; j < kept.length; j++) {
        if (kept[j].type === "heading") break;
        if (kept[j].type !== "spacer") {
          hasContent = true;
          break;
        }
      }
      if (!hasContent) continue;
    }
    result.push(block);
  }
  // Spacers at the very start or end add nothing.
  while (result[0]?.type === "spacer") result.shift();
  while (result[result.length - 1]?.type === "spacer") result.pop();
  return result;
}
