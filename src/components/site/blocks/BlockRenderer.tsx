import type { Block, BlockOfType } from "@/lib/content/schema";
import { renderableBlocks } from "@/lib/content/renderable";
import { refAspect } from "@/lib/media/url";
import { cn, isSafeUrl } from "@/lib/utils";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import { Container } from "../Container";
import { MediaVideo } from "../MediaVideo";
import { Reveal } from "../Reveal";
import { Figure } from "./Figure";

/* Layout widths: text sits on a comfortable measure, images go wider. */
const MEASURE = "mx-auto w-full max-w-[44rem]";
const WIDE = "mx-auto w-full max-w-[64rem]";

/** Essay blocks stay in the admin. The public page does not print them. */
const HIDDEN = new Set(["paragraph", "caption", "quote", "role_tools", "process", "spacer"]);

function isTextOnlySequence(block: Block): boolean {
  return block.type === "image_sequence" && !block.steps.some((step) => step.media);
}

/** A "My Role" heading whose only content is the role list. */
function isRoleOnlySection(blocks: Block[], index: number): boolean {
  let sawRole = false;
  for (let j = index + 1; j < blocks.length; j++) {
    const next = blocks[j];
    if (next.type === "heading") break;
    if (next.type === "role_tools") sawRole = true;
    else if (!HIDDEN.has(next.type) && !isTextOnlySequence(next)) return false;
  }
  return sawRole;
}

function isShown(block: Block): boolean {
  if (block.type === "fragrance") return Boolean(block.prototypeImage || block.referenceImages.some((item) => item.media));
  if (block.type === "image_sequence") return block.steps.some((step) => step.media);
  return !HIDDEN.has(block.type) && block.type !== "heading" && block.type !== "timeline" && block.type !== "stats" && block.type !== "link";
}

/** A paragraph that is really a list of short items, not a writeup. */
function shortLines(text: string): string[] {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 3 || lines.some((line) => line.length > 40)) return [];
  return lines;
}

/**
 * What a project page shows under the photo: the names of the work,
 * a short list when one was written as separate lines, and sprint titles.
 * Paragraphs are not included.
 */
export function ProjectBrief({ blocks }: { blocks: Block[] }) {
  const visible = renderableBlocks(blocks);
  const sections: { id: string; text: string; lines: string[] }[] = [];
  visible.forEach((block, index) => {
    if (block.type !== "heading" || isRoleOnlySection(visible, index)) return;
    const next = visible[index + 1];
    sections.push({
      id: block.id,
      text: block.text,
      lines: next?.type === "paragraph" ? shortLines(next.text) : [],
    });
  });

  const days = visible.flatMap((block) =>
    block.type === "timeline" ? block.items.filter((item) => item.title.trim()) : [],
  );
  const stats = visible.flatMap((block) =>
    block.type === "stats" ? block.items.filter((item) => item.value.trim()) : [],
  );

  if (!sections.length && !days.length && !stats.length) return null;

  return (
    <Container className="mt-10 md:mt-14">
      {sections.length ? (
        <ul className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 md:grid-cols-3">
          {sections.map((section) => (
            <li key={section.id}>
              <h2 className="text-base font-medium leading-snug text-fg">{section.text}</h2>
              {section.lines.length ? (
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{section.lines.join(" · ")}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {days.length ? (
        <ol className="mt-8 grid grid-cols-3 gap-6">
          {days.map((day) => (
            <li key={day.id}>
              {day.label ? <p className="text-xs text-fg-muted">{day.label}</p> : null}
              <p className="text-base font-medium text-fg">{day.title}</p>
            </li>
          ))}
        </ol>
      ) : null}
      {stats.length ? (
        <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.id}>
              <dd className="font-serif text-2xl font-medium leading-none">{item.value}</dd>
              <dt className="mt-1.5 text-sm text-fg-muted">{item.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}
    </Container>
  );
}

/** Section names and a fragrance name, for the line next to the cover. */
export function workLabels(blocks: Block[]): { headings: BlockOfType<"heading">[]; name: string } {
  const visible = renderableBlocks(blocks);
  const headings: BlockOfType<"heading">[] = [];
  let name = "";
  visible.forEach((block, index) => {
    if (block.type === "heading" && !isRoleOnlySection(visible, index)) headings.push(block);
    if (block.type === "fragrance" && block.name.trim() && !name) name = block.name.trim();
  });
  return { headings, name };
}

/** Pictures only. The names of the work are rendered beside the cover. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const visible = renderableBlocks(blocks).filter(isShown);
  if (!visible.length) return null;
  return (
    <div className="flex flex-col gap-6">
      {visible.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "image_large":
      return (
        <Container>
          <Reveal>
            <Figure media={block.media} caption={block.caption} tag={block.tag} sizes="(min-width: 768px) 50vw, 100vw" />
          </Reveal>
        </Container>
      );
    case "image_full":
      return (
        <Container>
          <Reveal>
            <Figure media={block.media} caption={block.caption} tag={block.tag} sizes="(min-width: 1024px) 80rem, 100vw" />
          </Reveal>
        </Container>
      );
    case "image_two_column":
      return (
        <Container>
          <Reveal className="grid gap-6 md:grid-cols-2 md:gap-8">
            {block.images
              .filter((i) => i.media)
              .slice(0, 2)
              .map((item) => (
                <Figure key={item.id} media={item.media} caption={item.caption} tag={item.tag} sizes="(min-width: 768px) 44rem, 100vw" />
              ))}
          </Reveal>
        </Container>
      );
    case "image_grid":
      return <ImageGrid block={block} />;
    case "moodboard":
      return <Moodboard block={block} />;
    case "image_sequence":
      return <ImageSequence block={block} />;
    case "before_after":
      return (
        <Container>
          <Reveal as="figure" className={WIDE}>
            <BeforeAfterSlider
              before={block.before}
              after={block.after}
              beforeLabel={block.beforeLabel || "Before"}
              afterLabel={block.afterLabel || "After"}
              sizes="(min-width: 1024px) 64rem, 100vw"
            />

          </Reveal>
        </Container>
      );
    case "video":
      return <Video block={block} />;
    case "heading":
    case "paragraph":
    case "caption":
    case "quote":
    case "process":
    case "role_tools":
      return null;
    case "stats": {
      const items = block.items.filter((i) => i.value.trim());
      return (
        <Container>
          <Reveal className={WIDE}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
              {items.map((item) => (
                <div key={item.id}>
                  <dd className="font-serif text-2xl font-medium leading-none md:text-3xl">{item.value}</dd>
                  <dt className="mt-1.5 text-sm text-fg-muted">{item.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      );
    }
    case "timeline":
      return (
        <Container>
          <Reveal className="mx-auto w-full max-w-3xl">
            <ol className="flex flex-wrap gap-x-8 gap-y-3">
              {block.items.map((item) => (
                <li key={item.id}>
                  {item.label ? <p className="text-xs text-fg-muted">{item.label}</p> : null}
                  {item.title ? <p className="text-sm font-medium text-fg">{item.title}</p> : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      );
    case "fragrance":
      return <Fragrance block={block} />;
    case "link":
      return (
        <Container>
          <Reveal className={MEASURE}>
            {block.style === "button" ? (
              <a
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow inline-flex items-center gap-3 border border-fg px-6 py-4 text-fg transition-colors duration-300 hover:bg-fg hover:text-bg"
              >
                {block.label}
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <a href={block.url} target="_blank" rel="noopener noreferrer" className="link-line inline-flex items-center gap-2 text-[1.0625rem] text-fg">
                {block.label}
                <span aria-hidden className="text-fg-muted">↗</span>
              </a>
            )}
          </Reveal>
        </Container>
      );
    case "spacer":
      return <div aria-hidden className={cn(block.size === "sm" && "h-2", block.size === "md" && "h-10", block.size === "lg" && "h-24")} />;
  }
}

function ImageGrid({ block }: { block: BlockOfType<"image_grid"> }) {
  const images = block.images.filter((i) => i.media);
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" }[block.columns];
  const sizes = `(min-width: 768px) ${Math.round(100 / block.columns)}vw, 50vw`;
  return (
    <Container>
      <Reveal as="figure">
        <div className={cn("grid grid-cols-2 gap-4 md:gap-6", cols, block.aspect === "natural" && "items-start")}>
          {images.map((item) => (
            <Figure key={item.id} media={item.media} caption={item.caption} tag={item.tag} aspect={block.aspect} sizes={sizes} />
          ))}
        </div>
      </Reveal>
    </Container>
  );
}

function Moodboard({ block }: { block: BlockOfType<"moodboard"> }) {
  const images = block.images.filter((i) => i.media);
  const cols = { 3: "md:columns-3", 4: "md:columns-4", 5: "md:columns-5" }[block.columns];
  const sizes = `(min-width: 768px) ${Math.round(100 / block.columns)}vw, 50vw`;
  return (
    <Container>
      <Reveal as="figure">
        <div className={cn("columns-2 gap-4 md:gap-5", cols)}>
          {images.map((item) => (
            <Figure key={item.id} media={item.media} caption={item.caption} tag={item.tag} sizes={sizes} className="mb-4 break-inside-avoid md:mb-5" />
          ))}
        </div>
      </Reveal>
    </Container>
  );
}

function ImageSequence({ block }: { block: BlockOfType<"image_sequence"> }) {
  const steps = block.steps.filter((s) => s.media || s.label.trim());
  const anyImage = steps.some((s) => s.media);
  const count = Math.min(Math.max(steps.length, 2), 5);
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" }[count];

  if (!anyImage) return null;

  return (
    <Container>
      <Reveal as="figure">
        <ol className={cn("grid grid-cols-2 gap-4 md:gap-6", cols)}>
          {steps.map((step) => (
            <li key={step.id}>
              {step.label ? <p className="mb-2 text-sm font-medium text-fg">{step.label}</p> : null}
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-bg-elevated">
                {step.media ? <Figure media={step.media} aspect="landscape" sizes={`(min-width: 768px) ${Math.round(100 / count)}vw, 50vw`} /> : null}
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </Container>
  );
}

function Video({ block }: { block: BlockOfType<"video"> }) {
  const embed = embedUrl(block.url);
  return (
    <Container>
      <Reveal as="figure" className={WIDE}>
        {block.media ? (
          <MediaVideo media={block.media} poster={block.poster} autoplay={block.autoplay} loop={block.loop} />
        ) : embed ? (
          <div className="relative aspect-video w-full overflow-hidden bg-bg-elevated">
            <iframe
              src={embed}
              title={block.caption || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : isSafeUrl(block.url) ? (
          <video src={block.url} controls playsInline className="h-auto w-full" />
        ) : null}
      </Reveal>
    </Container>
  );
}

/** Turns a YouTube or Vimeo page link into an embeddable player URL. */
function embedUrl(url: string): string | null {
  if (!isSafeUrl(url)) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function Fragrance({ block }: { block: BlockOfType<"fragrance"> }) {
  const notes = [block.topNotes, block.middleNotes, block.baseNotes].map((value) => value.trim()).filter(Boolean);
  const references = block.referenceImages.filter((i) => i.media);

  return (
    <Container>
      <Reveal className="mx-auto w-full max-w-3xl">
        <div>
          {block.status ? <p className="text-xs text-fg-muted">{block.status}</p> : null}
          {block.name ? <h3 className="font-serif text-xl font-medium leading-tight">{block.name}</h3> : null}
          {notes.length ? <p className="mt-1 text-sm text-fg-muted">{notes.join(" · ")}</p> : null}
        </div>
        {block.prototypeImage ? (
          <div className="mt-4 max-w-sm">
            <Figure media={block.prototypeImage} tag="Prototype" sizes="(min-width: 768px) 24rem, 100vw" />
          </div>
        ) : null}
        {references.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {references.map((item) => (
              <Figure key={item.id} media={item.media} sizes="(min-width: 768px) 16rem, 50vw" />
            ))}
          </div>
        ) : null}
      </Reveal>
    </Container>
  );
}

export { refAspect };
