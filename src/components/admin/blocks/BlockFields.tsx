"use client";

import type { Block, BlockOfType } from "@/lib/content/schema";
import { newId } from "@/lib/utils";
import { MediaField } from "../MediaField";
import { TagInput } from "../TagInput";
import { Field, Input, Select, Textarea, Toggle } from "../ui";
import { ImageItemsEditor } from "./ImageItemsEditor";
import { ItemList } from "./ItemList";

interface Props {
  block: Block;
  onChange: (block: Block) => void;
}

/** Renders the form for one block, depending on its type. */
export function BlockFields({ block, onChange }: Props) {
  // `set` merges a partial update while keeping the block's type intact.
  const set = <T extends Block>(b: T) => (patch: Partial<T>) => onChange({ ...b, ...patch });

  switch (block.type) {
    case "image_large":
    case "image_full": {
      const update = set(block);
      return (
        <MediaField
          value={block.media}
          onChange={(media) => update({ media })}
          kinds={["image", "video"]}
          caption={{ value: block.caption, onChange: (caption) => update({ caption }) }}
          tag={{ value: block.tag, onChange: (tag) => update({ tag }) }}
          hint={block.type === "image_full" ? "Shown edge to edge. Landscape images work best." : "Shown at content width."}
        />
      );
    }
    case "image_two_column": {
      const update = set(block);
      return <ImageItemsEditor items={block.images} onChange={(images) => update({ images })} max={2} />;
    }
    case "image_grid": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Columns">
              <Select value={block.columns} onChange={(e) => update({ columns: Number(e.target.value) as 2 | 3 | 4 })}>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </Select>
            </Field>
            <Field label="Image shape">
              <Select value={block.aspect} onChange={(e) => update({ aspect: e.target.value as BlockOfType<"image_grid">["aspect"] })}>
                <option value="natural">Natural (keeps original ratio)</option>
                <option value="square">Square (Instagram-style)</option>
                <option value="portrait">Portrait 4:5</option>
                <option value="landscape">Landscape 3:2</option>
              </Select>
            </Field>
            <Field label="Grid caption">
              <Input value={block.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Optional" />
            </Field>
          </div>
          <ImageItemsEditor items={block.images} onChange={(images) => update({ images })} />
        </div>
      );
    }
    case "moodboard": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Columns">
              <Select value={block.columns} onChange={(e) => update({ columns: Number(e.target.value) as 3 | 4 | 5 })}>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </Select>
            </Field>
            <Field label="Caption" className="sm:col-span-2">
              <Input value={block.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Optional" />
            </Field>
          </div>
          <ImageItemsEditor items={block.images} onChange={(images) => update({ images })} />
        </div>
      );
    }
    case "image_sequence": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <ItemList
            items={block.steps}
            onChange={(steps) => update({ steps })}
            addLabel="Add step"
            max={5}
            create={() => ({ id: newId(), label: "", media: null, caption: "" })}
            renderItem={(step, updateStep, index) => (
              <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
                <div className="flex flex-col gap-2">
                  <Input value={step.label} onChange={(e) => updateStep({ label: e.target.value })} placeholder={`Step ${index + 1} label, e.g. Reference`} aria-label="Step label" />
                  <Input value={step.caption} onChange={(e) => updateStep({ caption: e.target.value })} placeholder="Caption (optional)" aria-label="Step caption" />
                </div>
                <MediaField value={step.media} onChange={(media) => updateStep({ media })} thumbClassName="h-20 w-20" />
              </div>
            )}
          />
          <Field label="Caption under the sequence">
            <Input value={block.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Optional" />
          </Field>
        </div>
      );
    }
    case "before_after": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MediaField label="Before image" value={block.before} onChange={(before) => update({ before })} />
            <MediaField label="After image" value={block.after} onChange={(after) => update({ after })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Left label">
              <Input value={block.beforeLabel} onChange={(e) => update({ beforeLabel: e.target.value })} placeholder="Before" />
            </Field>
            <Field label="Right label">
              <Input value={block.afterLabel} onChange={(e) => update({ afterLabel: e.target.value })} placeholder="After" />
            </Field>
            <Field label="Caption">
              <Input value={block.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Optional" />
            </Field>
          </div>
        </div>
      );
    }
    case "video": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MediaField label="Uploaded video (MP4 or WebM)" value={block.media} onChange={(media) => update({ media })} kinds={["video"]} withAlt={false} />
            <MediaField label="Poster image (shown before playback)" value={block.poster} onChange={(poster) => update({ poster })} />
          </div>
          <Field label="Or a YouTube / Vimeo link" hint="Used only when no video is uploaded.">
            <Input value={block.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          <div className="flex flex-wrap gap-6">
            <Toggle checked={block.autoplay} onChange={(autoplay) => update({ autoplay })} label="Autoplay (muted, no controls)" />
            <Toggle checked={block.loop} onChange={(loop) => update({ loop })} label="Loop" />
          </div>
          <Field label="Caption">
            <Input value={block.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Optional" />
          </Field>
        </div>
      );
    }
    case "heading": {
      const update = set(block);
      return (
        <div className="grid gap-3 sm:grid-cols-[6rem_1fr_8rem]">
          <Field label="Number">
            <Input value={block.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} placeholder="01" />
          </Field>
          <Field label="Heading">
            <Input value={block.text} onChange={(e) => update({ text: e.target.value })} placeholder="Concept" />
          </Field>
          <Field label="Size">
            <Select value={block.level} onChange={(e) => update({ level: Number(e.target.value) as 2 | 3 })}>
              <option value={2}>Large</option>
              <option value={3}>Small</option>
            </Select>
          </Field>
        </div>
      );
    }
    case "paragraph": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-3">
          <Textarea rows={6} value={block.text} onChange={(e) => update({ text: e.target.value })} placeholder="Write here. Leave an empty line between paragraphs." aria-label="Paragraph text" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Style">
              <Select value={block.style} onChange={(e) => update({ style: e.target.value as BlockOfType<"paragraph">["style"] })}>
                <option value="body">Body text</option>
                <option value="lead">Lead (large serif introduction)</option>
                <option value="small">Small note</option>
              </Select>
            </Field>
            <Field label="Columns" hint="Two columns suit short lists.">
              <Select value={block.columns} onChange={(e) => update({ columns: Number(e.target.value) as 1 | 2 })}>
                <option value={1}>One</option>
                <option value={2}>Two</option>
              </Select>
            </Field>
          </div>
          <p className="text-xs text-neutral-500">Optional styling: *italic* and **bold**.</p>
        </div>
      );
    }
    case "quote": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-3">
          <Textarea rows={3} value={block.text} onChange={(e) => update({ text: e.target.value })} placeholder="A large statement or excerpt" aria-label="Quote" />
          <Field label="Attribution">
            <Input value={block.attribution} onChange={(e) => update({ attribution: e.target.value })} placeholder="Optional, e.g. Brand manifesto" />
          </Field>
        </div>
      );
    }
    case "caption": {
      const update = set(block);
      return <Textarea rows={2} value={block.text} onChange={(e) => update({ text: e.target.value })} placeholder="Small supporting note" aria-label="Caption" />;
    }
    case "stats": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-3">
          <ItemList
            items={block.items}
            onChange={(items) => update({ items })}
            addLabel="Add statistic"
            max={8}
            create={() => ({ id: newId(), value: "", label: "" })}
            renderItem={(item, updateItem) => (
              <div className="grid gap-2 sm:grid-cols-2">
                <Input value={item.value} onChange={(e) => updateItem({ value: e.target.value })} placeholder="[Add figure], e.g. 120" aria-label="Value" />
                <Input value={item.label} onChange={(e) => updateItem({ label: e.target.value })} placeholder="Label, e.g. Items sold" aria-label="Label" />
              </div>
            )}
          />
          <p className="text-xs text-neutral-500">Statistics without a figure stay hidden on the site until you fill them in.</p>
          <Field label="Note">
            <Input value={block.note} onChange={(e) => update({ note: e.target.value })} placeholder="Optional, e.g. As of September 2026" />
          </Field>
        </div>
      );
    }
    case "timeline": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-3">
          <ItemList
            items={block.items}
            onChange={(items) => update({ items })}
            addLabel="Add phase"
            create={() => ({ id: newId(), label: "", title: "", items: [] })}
            renderItem={(item, updateItem) => (
              <div className="grid gap-2 md:grid-cols-[8rem_1fr_1fr]">
                <Input value={item.label} onChange={(e) => updateItem({ label: e.target.value })} placeholder="Day 01" aria-label="Label" />
                <Input value={item.title} onChange={(e) => updateItem({ title: e.target.value })} placeholder="Title, e.g. Strategy" aria-label="Title" />
                <Textarea rows={3} value={item.items.join("\n")} onChange={(e) => updateItem({ items: e.target.value.split("\n") })} onBlur={(e) => updateItem({ items: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} placeholder="One point per line" aria-label="Points" />
              </div>
            )}
          />
          <Field label="Note under the timeline">
            <Input value={block.note} onChange={(e) => update({ note: e.target.value })} placeholder="Optional clarification" />
          </Field>
        </div>
      );
    }
    case "process": {
      const update = set(block);
      return (
        <ItemList
          items={block.steps}
          onChange={(steps) => update({ steps })}
          addLabel="Add step"
          create={() => ({ id: newId(), title: "", description: "" })}
          renderItem={(step, updateStep) => (
            <div className="grid gap-2 md:grid-cols-2">
              <Input value={step.title} onChange={(e) => updateStep({ title: e.target.value })} placeholder="Step title" aria-label="Step title" />
              <Input value={step.description} onChange={(e) => updateStep({ description: e.target.value })} placeholder="Short description (optional)" aria-label="Step description" />
            </div>
          )}
        />
      );
    }
    case "fragrance": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <Field label="Fragrance name">
              <Input value={block.name} onChange={(e) => update({ name: e.target.value })} placeholder="When Summer Sleeps" />
            </Field>
            <Field label="Status">
              <Input value={block.status} onChange={(e) => update({ status: e.target.value })} placeholder="Prototype" />
            </Field>
          </div>
          <Field label="Story">
            <Textarea rows={4} value={block.story} onChange={(e) => update({ story: e.target.value })} placeholder="The idea behind the scent" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Top notes">
              <Input value={block.topNotes} onChange={(e) => update({ topNotes: e.target.value })} placeholder="[Add notes]" />
            </Field>
            <Field label="Middle notes">
              <Input value={block.middleNotes} onChange={(e) => update({ middleNotes: e.target.value })} placeholder="[Add notes]" />
            </Field>
            <Field label="Base notes">
              <Input value={block.baseNotes} onChange={(e) => update({ baseNotes: e.target.value })} placeholder="[Add notes]" />
            </Field>
          </div>
          <MediaField label="Prototype photograph" value={block.prototypeImage} onChange={(prototypeImage) => update({ prototypeImage })} caption={{ value: block.prototypeCaption, onChange: (prototypeCaption) => update({ prototypeCaption }) }} />
          <Field label="Reference imagery">
            <ImageItemsEditor items={block.referenceImages} onChange={(referenceImages) => update({ referenceImages })} />
          </Field>
          <Field label="Development notes">
            <Textarea rows={3} value={block.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Optional" />
          </Field>
        </div>
      );
    }
    case "link": {
      const update = set(block);
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_8rem]">
          <Field label="Label">
            <Input value={block.label} onChange={(e) => update({ label: e.target.value })} placeholder="Instagram" />
          </Field>
          <Field label="URL" hint="Hidden on the site until a valid https:// link is added.">
            <Input value={block.url} onChange={(e) => update({ url: e.target.value })} placeholder="[Add Instagram URL]" />
          </Field>
          <Field label="Style">
            <Select value={block.style} onChange={(e) => update({ style: e.target.value as "button" | "text" })}>
              <option value="button">Button</option>
              <option value="text">Text link</option>
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-3">
            <Input value={block.description} onChange={(e) => update({ description: e.target.value })} placeholder="Optional line under the link" />
          </Field>
        </div>
      );
    }
    case "role_tools": {
      const update = set(block);
      return (
        <div className="flex flex-col gap-4">
          <Field label="Role" hint="Press Enter after each item.">
            <TagInput value={block.role} onChange={(role) => update({ role })} placeholder="Brand Strategy" />
          </Field>
          <Field label="Tools">
            <TagInput value={block.tools} onChange={(tools) => update({ tools })} placeholder="Photoshop" />
          </Field>
          <Field label="Extra rows">
            <ItemList
              items={block.rows}
              onChange={(rows) => update({ rows })}
              addLabel="Add row"
              create={() => ({ id: newId(), label: "", value: "" })}
              renderItem={(row, updateRow) => (
                <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                  <Input value={row.label} onChange={(e) => updateRow({ label: e.target.value })} placeholder="Label, e.g. Platform" aria-label="Row label" />
                  <Input value={row.value} onChange={(e) => updateRow({ value: e.target.value })} placeholder="Value" aria-label="Row value" />
                </div>
              )}
            />
          </Field>
        </div>
      );
    }
    case "spacer": {
      const update = set(block);
      return (
        <Field label="Size" className="max-w-xs">
          <Select value={block.size} onChange={(e) => update({ size: e.target.value as "sm" | "md" | "lg" })}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </Select>
        </Field>
      );
    }
  }
}
