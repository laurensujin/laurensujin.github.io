import { cn } from "@/lib/utils";

/**
 * Generated stand-in visual for images that have not been uploaded yet:
 * a soft, warm gradient study with grain and a hairline frame, plus an
 * optional serif monogram. Deterministic per `seed`, so the same project
 * always gets the same look. Replaced automatically once a real image exists.
 */

const PALETTES: [string, string, string][] = [
  ["#eadfd1", "#cbb59f", "#8b7461"], // sand & clay
  ["#e6e2db", "#b9b2a6", "#6b655d"], // stone
  ["#ecdcd4", "#d0aca0", "#8c6156"], // rose clay
  ["#e4e5dc", "#b6baa5", "#6e735f"], // sage
  ["#efe3d0", "#d8ba92", "#9a7a51"], // honey
  ["#e2dfe0", "#b4adb3", "#6d666d"], // mauve grey
];

const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

interface Props {
  seed: string;
  /** Large serif letter(s) drawn faintly in the composition. */
  monogram?: string;
  /** Small caption in the corner. */
  label?: string;
  /** Thin inset frame (off for full-bleed covers). */
  frame?: boolean;
  className?: string;
}

export function PlaceholderArt({ seed, monogram, label, frame = true, className }: Props) {
  const h = hash(seed || "portfolio");
  const [light, mid, deep] = PALETTES[h % PALETTES.length];
  const x1 = 20 + (h % 50);
  const y1 = 15 + ((h >> 4) % 40);
  const x2 = 55 + ((h >> 8) % 40);
  const y2 = 55 + ((h >> 12) % 40);
  const angle = (h >> 16) % 360;

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        backgroundColor: light,
        backgroundImage: [
          `radial-gradient(ellipse 70% 60% at ${x1}% ${y1}%, ${mid} 0%, transparent 70%)`,
          `radial-gradient(ellipse 55% 75% at ${x2}% ${y2}%, ${deep} 0%, transparent 72%)`,
          `linear-gradient(${angle}deg, ${light} 0%, ${mid} 100%)`,
        ].join(", "),
      }}
    >
      <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply" style={{ backgroundImage: `url("${GRAIN}")` }} />
      {frame ? <div className="absolute inset-3 border border-white/50" /> : null}
      {monogram ? (
        <span className="absolute left-3 top-3 select-none font-serif text-sm font-medium text-[#3d342c]/55">{monogram}</span>
      ) : null}
      {label ? <span className="absolute bottom-3 left-3 text-sm font-medium text-[#3d342c]/70">{label}</span> : null}
    </div>
  );
}


