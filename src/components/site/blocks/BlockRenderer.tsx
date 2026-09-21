import type { ReactNode } from "react";
import type { Block, BlockOfType } from "@/lib/content/schema";
import { renderableBlocks } from "@/lib/content/renderable";
import { refAspect } from "@/lib/media/url";
import { cn, isSafeUrl } from "@/lib/utils";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import { Container } from "../Container";
import { MediaVideo } from "../MediaVideo";
import { Reveal } from "../Reveal";
import { RichText, renderInline } from "../RichText";
import { Figure } from "./Figure";

/* Layout widths: text sits on a comfortable measure, images go wider. */
const MEASURE = "mx-auto w-full max-w-[44rem]";
const WIDE = "mx-auto w-full max-w-[64rem]";

type NoteBlock = BlockOfType<"paragraph"> | BlockOfType<"caption">;

function isNote(block: Block): block is NoteBlock {
  return block.type === "paragraph" || block.type === "caption";
}

/**
 * A heading and the sentences written under it read as one row: the thing
 * you did on the left, the short note on the right. Images stay on their own.
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const visible = renderableBlocks(blocks);
  const items: ReactNode[] = [];

  for (let i = 0; i < visible.length; i++) {
    const block = visible[i];
    if (block.type === "heading") {
      const notes: NoteBlock[] = [];
      while (i + 1 < visible.length && isNote(visible[i + 1])) notes.push(visible[++i] as NoteBlock);
      items.push(<SectionRow key={block.id} heading={block} notes={notes} />);
    } else {
      items.push(<BlockView key={block.id} block={block} />);
    }
  }

  return <div className="flex flex-col gap-5 md:gap-6">{items}</div>;
}

function SectionRow({ heading, notes }: { heading: BlockOfType<"heading">; notes: NoteBlock[] }) {
  const Title = heading.level === 3 ? "h3" : "h2";
  return (
    <Container>
      <Reveal className="mx-auto grid w-full max-w-3xl items-baseline gap-1 md:grid-cols-[12rem_1fr] md:gap-8">
        <Title className="font-serif text-base font-medium leading-snug">{heading.text}</Title>
        {notes.length ? (
          <div className="flex flex-col gap-1">
            {notes.map((note) =>
              note.type === "caption" ? (
                <p key={note.id} className="text-sm leading-relaxed text-fg-muted">
                  {renderInline(note.text)}
                </p>
              ) : (
                <RichText key={note.id} text={note.text} className="flex flex-col gap-1" paragraphClassName="text-sm leading-relaxed text-fg-muted" />
              ),
            )}
          </div>
        ) : null}
      </Reveal>
    </Container>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "image_large":
      return (
        <Container>
          <Reveal>
            <Figure media={block.media} caption={block.caption} tag={block.tag} sizes="(min-width: 768px) 48rem, 100vw" className="mx-auto max-w-3xl" />
          </Reveal>
        </Container>
      );
    case "image_full":
      return (
        <Container>
          <Reveal>
            <Figure media={block.media} caption={block.caption} tag={block.tag} sizes="(min-width: 1024px) 64rem, 100vw" className="mx-auto max-w-3xl" />
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
            {block.caption ? <figcaption className="mt-3 text-sm text-fg-muted">{block.caption}</figcaption> : null}
          </Reveal>
        </Container>
      );
    case "video":
      return <Video block={block} />;
    case "heading":
      return <SectionRow heading={block} notes={[]} />;
    case "paragraph":
      return (
        <Container>
          <Reveal className="mx-auto w-full max-w-3xl">
            <RichText
              text={block.text}
              className={cn("flex flex-col gap-2", block.columns === 2 && "md:block md:columns-2 md:gap-8 [&>p]:mb-2")}
              paragraphClassName="text-sm leading-relaxed text-fg-muted"
            />
          </Reveal>
        </Container>
      );
    case "quote":
      return (
        <Container>
          <Reveal as="figure" className={WIDE}>
            <blockquote className="border-l-2 border-accent pl-4 text-base leading-relaxed text-fg md:text-lg">
              {renderInline(block.text)}
            </blockquote>
            {block.attribution ? <figcaption className="eyebrow mt-6">{block.attribution}</figcaption> : null}
          </Reveal>
        </Container>
      );
    case "caption":
      return (
        <Container>
          <Reveal className={MEASURE}>
            <p className="text-sm leading-relaxed text-fg-muted">{renderInline(block.text)}</p>
          </Reveal>
        </Container>
      );
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
            {block.note ? <p className="mt-6 text-sm text-fg-muted">{block.note}</p> : null}
          </Reveal>
        </Container>
      );
    }
    case "timeline":
      return (
        <Container>
          <Reveal className={WIDE}>
            <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
              {block.items.map((item) => (
                <li key={item.id}>
                  {item.label ? <p className="text-sm text-fg-muted">{item.label}</p> : null}
                  {item.title ? <p className="mt-1 font-serif text-base font-medium leading-tight">{item.title}</p> : null}
                  {item.items.length ? (
                    <ul className="mt-2 space-y-1 text-sm leading-relaxed text-fg-muted">
                      {item.items.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
            {block.note ? <p className="mt-10 max-w-[60ch] text-sm italic leading-relaxed text-fg-muted">{block.note}</p> : null}
          </Reveal>
        </Container>
      );
    case "process": {
      const steps = block.steps.filter((s) => s.title.trim());
      return (
        <Container>
          <Reveal className={WIDE}>
            <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium text-fg">{step.title}</span>
                  {step.description ? <span className="text-fg-muted">{step.description}</span> : null}
                  {index < steps.length - 1 ? (
                    <span aria-hidden className="text-accent">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      );
    }
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
            {block.description ? <p className="mt-4 text-sm text-fg-muted">{block.description}</p> : null}
          </Reveal>
        </Container>
      );
    case "role_tools": {
      const rows: { label: string; value: string }[] = [];
      if (block.role.length) rows.push({ label: "Role", value: block.role.join(", ") });
      if (block.tools.length) rows.push({ label: "Tools", value: block.tools.join(", ") });
      block.rows.filter((r) => r.value.trim()).forEach((r) => rows.push({ label: r.label, value: r.value }));
      return (
        <Container>
          <Reveal className={WIDE}>
            <dl className="border-t border-line">
              {rows.map((row, index) => (
                <div key={index} className="grid gap-2 border-b border-line py-5 md:grid-cols-12 md:gap-8">
                  <dt className="eyebrow md:col-span-3">{row.label}</dt>
                  <dd className="text-[15px] leading-relaxed text-fg md:col-span-9">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      );
    }
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
        {block.caption ? <figcaption className="mt-4 text-sm text-fg-muted">{block.caption}</figcaption> : null}
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
        {block.caption ? <figcaption className="mt-4 text-sm text-fg-muted">{block.caption}</figcaption> : null}
      </Reveal>
    </Container>
  );
}

function ImageSequence({ block }: { block: BlockOfType<"image_sequence"> }) {
  const steps = block.steps.filter((s) => s.media || s.label.trim());
  const anyImage = steps.some((s) => s.media);
  const count = Math.min(Math.max(steps.length, 2), 5);
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" }[count];

  if (!anyImage) {
    // No images yet: show the workflow as a typographic sequence.
    return (
      <Container>
        <Reveal className={WIDE}>
          <ol className="flex flex-wrap items-baseline gap-x-3 gap-y-3 border-t border-line pt-8">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-baseline gap-3 text-base font-medium">
                {step.label}
                {index < steps.length - 1 ? (
                  <span aria-hidden className="text-fg-faint">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          {block.caption ? <p className="mt-4 text-sm text-fg-muted">{block.caption}</p> : null}
        </Reveal>
      </Container>
    );
  }

  return (
    <Container>
      <Reveal as="figure">
        <ol className={cn("grid grid-cols-2 gap-4 md:gap-6", cols)}>
          {steps.map((step, index) => (
            <li key={step.id}>
              <p className="eyebrow mb-3 flex items-center gap-2">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="text-fg">{step.label}</span>
              </p>
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-bg-elevated">
                {step.media ? <Figure media={step.media} aspect="landscape" sizes={`(min-width: 768px) ${Math.round(100 / count)}vw, 50vw`} /> : null}
              </div>
              {step.caption ? <p className="mt-2 text-sm text-fg-muted">{step.caption}</p> : null}
            </li>
          ))}
        </ol>
        {block.caption ? <figcaption className="mt-4 text-sm text-fg-muted">{block.caption}</figcaption> : null}
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
        {block.caption ? <figcaption className="mt-3 text-sm text-fg-muted">{block.caption}</figcaption> : null}
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
  const notes = [
    { label: "Top notes", value: block.topNotes },
    { label: "Middle notes", value: block.middleNotes },
    { label: "Base notes", value: block.baseNotes },
  ].filter((n) => n.value.trim());
  const references = block.referenceImages.filter((i) => i.media);

  return (
    <Container>
      <Reveal className="grid gap-10 border-t border-line pt-8 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-6">
          {block.status ? <p className="eyebrow">{block.status}</p> : null}
          <h3 className="mt-2 font-serif text-2xl font-medium leading-tight md:text-3xl">{block.name}</h3>
          {block.story ? <RichText text={block.story} className="mt-4 flex flex-col gap-3" paragraphClassName="text-sm leading-relaxed text-fg-muted" /> : null}
          {notes.length ? (
            <dl className="mt-8 border-t border-line">
              {notes.map((n) => (
                <div key={n.label} className="grid grid-cols-3 gap-4 border-b border-line py-4">
                  <dt className="eyebrow">{n.label}</dt>
                  <dd className="col-span-2 text-[15px] text-fg">{n.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {block.notes ? (
            <div className="mt-8">
              <p className="eyebrow">Development notes</p>
              <RichText text={block.notes} className="mt-3 flex flex-col gap-3" paragraphClassName="text-sm leading-relaxed text-fg-muted" />
            </div>
          ) : null}
        </div>
        <div className="md:col-span-5 md:col-start-8">
          {block.prototypeImage ? (
            <Figure media={block.prototypeImage} caption={block.prototypeCaption} tag="Prototype" sizes="(min-width: 768px) 40vw, 100vw" />
          ) : null}
        </div>
        {references.length ? (
          <div className="grid grid-cols-2 gap-4 md:col-span-12 md:grid-cols-4">
            {references.map((item) => (
              <Figure key={item.id} media={item.media} caption={item.caption} tag={item.tag} sizes="(min-width: 768px) 25vw, 50vw" />
            ))}
          </div>
        ) : null}
      </Reveal>
    </Container>
  );
}

export { refAspect };
