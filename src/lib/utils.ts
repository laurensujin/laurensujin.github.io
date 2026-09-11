/** Joins class names, skipping falsy values. Tiny stand-in for `clsx`. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Random id used for content blocks and list items (works in browser and Node). */
export function newId(): string {
  return crypto.randomUUID();
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Turns "MAISON DE L'ÉTÉ" into "maison-de-lete", "The Reader." into "the-reader". */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[’'`]/g, "") // drop apostrophes instead of splitting words
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Only http(s) and mailto links are rendered publicly. */
export function isSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const value = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(value);
}

/** Splits a comma or newline separated string into trimmed, non-empty items. */
export function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
