import { PlaceholderArt, monogramFor } from "./PlaceholderArt";

/** Stand-in shown when a project has no cover image yet. */
export function EmptyCover({ title }: { title: string }) {
  return <PlaceholderArt seed={title} monogram={monogramFor(title)} />;
}
