import { cn } from "@/lib/utils";

/**
 * Generated stand-in visual for images that have not been uploaded yet:
 * a soft neutral gradient study with grain and a hairline frame. Deterministic
 * per `seed`, so the same project always gets the same look. Replaced
 * automatically once a real image exists. It stays grey on purpose - the
 * photography is the only colour on the site.
 */

const PALETTES: [string, string, string][] = [
  ["#eeeef0", "#d4d4d8", "#9b9ba3"], // light grey
  ["#e9e9ec", "#c9c9d0", "#8e8e97"], // cool grey
  ["#ececec", "#d2d2d2", "#979797"], // neutral grey
  ["#e7e8ea", "#c6c8cc", "#8b8d93"], // slate grey
  ["#efeeed", "#d5d3d1", "#9a9795"], // warm grey
  ["#e8eaea", "#c8cccc", "#8d9192"], // stone grey
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
  /** Letter(s) drawn faintly in the corner. */
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
      {frame ? <div className="absolute inset-3 border border-white/45" /> : null}
      {monogram ? <span className="eyebrow absolute left-4 top-4 select-none text-[#17171a]/55">{monogram}</span> : null}
      {label ? <span className="eyebrow absolute bottom-4 left-4 text-[#17171a]/70">{label}</span> : null}
    </div>
  );
}


