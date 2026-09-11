/** Typographic stand-in shown when a project has no cover image yet. */
export function EmptyCover({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center border border-line bg-bg-elevated p-8">
      <span className="text-center font-serif text-3xl font-light italic leading-tight text-fg-muted md:text-5xl">{title}</span>
    </div>
  );
}
