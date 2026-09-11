/**
 * Generates supabase/seed.sql from the starter content below.
 *
 * Run:  node scripts/generate-seed.mjs
 *
 * The seed only contains copy taken from the project brief. Anything that was
 * not supplied (images, links, metrics) is left empty so it can be filled in
 * from /admin. Nothing here claims launches, revenue, or publications.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Tiny helpers that build content blocks (mirrors src/lib/content/blocks.ts)
// ---------------------------------------------------------------------------

let counter = 0;
const id = () => `seed-${String(++counter).padStart(3, "0")}`;
const img = (partial = {}) => ({ id: id(), media: null, caption: "", tag: "", ...partial });

const b = {
  heading: (eyebrow, text, level = 2) => ({ id: id(), type: "heading", eyebrow, text, level }),
  paragraph: (text, style = "body", columns = 1) => ({ id: id(), type: "paragraph", text, style, columns }),
  caption: (text) => ({ id: id(), type: "caption", text }),
  quote: (text, attribution = "") => ({ id: id(), type: "quote", text, attribution }),
  imageLarge: (caption = "", tag = "") => ({ id: id(), type: "image_large", media: null, caption, tag }),
  imageFull: (caption = "", tag = "") => ({ id: id(), type: "image_full", media: null, caption, tag }),
  twoColumn: (tags = ["", ""]) => ({
    id: id(),
    type: "image_two_column",
    images: tags.map((tag) => img({ tag })),
  }),
  grid: (caption = "", columns = 3, aspect = "natural") => ({
    id: id(),
    type: "image_grid",
    images: [],
    columns,
    aspect,
    caption,
  }),
  moodboard: (caption = "", columns = 4) => ({ id: id(), type: "moodboard", images: [], columns, caption }),
  sequence: (labels, caption = "") => ({
    id: id(),
    type: "image_sequence",
    steps: labels.map((label) => ({ id: id(), label, media: null, caption: "" })),
    caption,
  }),
  beforeAfter: (caption = "") => ({
    id: id(),
    type: "before_after",
    before: null,
    after: null,
    beforeLabel: "Before",
    afterLabel: "After",
    caption,
  }),
  video: (caption = "") => ({
    id: id(),
    type: "video",
    media: null,
    url: "",
    poster: null,
    autoplay: true,
    loop: true,
    caption,
  }),
  stats: (labels, note = "") => ({
    id: id(),
    type: "stats",
    items: labels.map((label) => ({ id: id(), value: "", label })),
    note,
  }),
  timeline: (items, note = "") => ({
    id: id(),
    type: "timeline",
    items: items.map(([label, title, lines]) => ({ id: id(), label, title, items: lines })),
    note,
  }),
  process: (titles) => ({
    id: id(),
    type: "process",
    steps: titles.map((title) => ({ id: id(), title, description: "" })),
  }),
  fragrance: (name, status = "Prototype") => ({
    id: id(),
    type: "fragrance",
    name,
    status,
    story: "",
    topNotes: "",
    middleNotes: "",
    baseNotes: "",
    referenceImages: [],
    prototypeImage: null,
    prototypeCaption: "",
    notes: "",
  }),
  link: (label, url = "", description = "") => ({ id: id(), type: "link", label, url, style: "button", description }),
  roleTools: (role, tools = [], rows = []) => ({
    id: id(),
    type: "role_tools",
    role,
    tools,
    rows: rows.map(([label, value]) => ({ id: id(), label, value })),
  }),
  spacer: (size = "md") => ({ id: id(), type: "spacer", size }),
};

const project = (fields) => ({
  title: "",
  slug: "",
  subtitle: "",
  categories: [],
  year: "",
  dateRange: "",
  projectStatus: "",
  shortDescription: "",
  cover: null,
  coverVideo: null,
  tags: [],
  projectUrl: "",
  projectUrlLabel: "",
  socialUrl: "",
  socialLabel: "",
  role: [],
  tools: [],
  blocks: [],
  seoTitle: "",
  seoDescription: "",
  ...fields,
});

// ---------------------------------------------------------------------------
// Site settings and profile
// ---------------------------------------------------------------------------

const siteSettings = {
  site_name: "Sujin Lee",
  hero_headline: "Marketing, brand development,\nproduct thinking\n& visual storytelling.",
  hero_description:
    "I develop ideas from concept to execution across branding, digital products, e-commerce, photography, and content.",
  hero_location: "Based in Atlanta, Georgia.",
  hero_cta_label: "Selected Work",
  selected_work_label: "Selected Work",
  photography_label: "Portrait",
  photography_subtitle: "Photography · Retouching · Visual Direction",
  photography_description:
    "Portrait photography and retouching focused on natural skin texture, composition, facial balance, and polished editorial presentation.",
  footer_location: "Atlanta, GA",
  footer_copyright: "© 2026 Sujin Lee",
  footer_credit: "Designed & developed by Sujin Lee.",
  contact_email: "",
  seo_title: "Sujin Lee | Marketing, Brand Development & Creative Direction",
  seo_description:
    "Portfolio of Sujin Lee: marketing, brand development, product thinking, e-commerce, visual content and creative direction. Based in Atlanta, Georgia.",
};

const profile = {
  name: "Sujin Lee",
  title: "Marketing · Brand · Product",
  location: "Atlanta, Georgia",
  about:
    "I develop ideas from concept to execution across branding, digital products, e-commerce, photography, and content. My work moves from research and concept through visual identity, product development, and market execution, with a focus on refined, image-led storytelling.",
};

const education = [
  {
    school: "Georgia State University",
    college: "J. Mack Robinson College of Business",
    degree: "Bachelor of Business Administration",
    major: "Marketing",
    graduation: "Expected May 2027",
  },
];

// URLs are intentionally empty: fill them in under /admin → Profile → Links.
const socialLinks = [
  { label: "LinkedIn", kind: "linkedin", url: "", show_in_profile: true, show_in_footer: true },
  { label: "Instagram", kind: "instagram", url: "", show_in_profile: true, show_in_footer: true },
  { label: "Email", kind: "email", url: "", show_in_profile: true, show_in_footer: true },
  { label: "GitHub", kind: "github", url: "", show_in_profile: true, show_in_footer: false },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const maisonRole = [
  "Brand Strategy",
  "Creative Direction",
  "Copywriting",
  "Naming",
  "Storytelling",
  "Fragrance Concept Development",
  "Visual Identity",
  "Logo Design",
  "Typography",
  "Label Design",
  "Packaging Concepts",
  "Supplier Research",
  "Art Direction",
  "Prompt Development",
  "AI-Assisted Visual Production",
  "Photo Retouching",
  "Social Media Content",
  "Web Design",
  "Video Content",
];

const maison = project({
  title: "MAISON DE L’ÉTÉ",
  slug: "maison-de-lete",
  subtitle: "Independent Fragrance Brand Development",
  categories: ["Brand Development", "Creative Direction", "Product Development", "Visual Identity"],
  year: "2026",
  dateRange: "2026–Present",
  projectStatus: "In Development",
  shortDescription:
    "An independently developed fragrance brand, taken from first concept through brand strategy, fragrance direction, visual identity, product prototyping, and supplier research.",
  tags: ["Fragrance", "Branding", "Packaging", "AI-Assisted Production"],
  socialLabel: "Instagram",
  socialUrl: "",
  role: ["Founder", "Brand Strategy", "Creative Direction", "Product Development"],
  blocks: [
    b.paragraph(
      "I independently developed MAISON DE L’ÉTÉ from its initial concept through brand strategy, fragrance direction, visual identity, product prototyping, supplier research, and digital content development.",
      "lead",
    ),
    b.caption(
      "An active pre-launch project: the brand is in product development and has not been commercially released.",
    ),
    b.imageFull("Campaign direction", ""),

    b.heading("01", "Concept"),
    b.paragraph(
      "The concept phase defined the brand’s positioning, storytelling, naming, slogans, and copywriting, and shaped an emotional brand world around a clearly defined target customer and visual direction.",
    ),
    b.imageLarge("Brand positioning and storytelling"),

    b.heading("02", "Research & References"),
    b.paragraph(
      "Research informed every part of the brand: fragrance direction, packaging, photography, typography, product styling, and visual identity.",
    ),
    b.moodboard("Reference and moodboard imagery", 4),

    b.heading("03", "Fragrance Development"),
    b.paragraph(
      "The project includes original fragrance concepts and custom physical prototypes. Custom fragrance prototypes were commissioned through independent perfumers.",
    ),
    b.fragrance("When Summer Sleeps", "Prototype"),

    b.heading("04", "Visual Identity"),
    b.paragraph(
      "Logo development, typography, label design, business card design, and the wider visual system, including the iterations behind each decision. Designs that were not physically manufactured are labelled as design concepts.",
    ),
    b.grid("Logo development, typography, labels and business cards", 3, "natural"),

    b.heading("05", "Product & Packaging"),
    b.paragraph(
      "Perfume bottle design concepts, label applications, packaging concepts, mockups, iterations, and AI-assisted renderings. Conceptual renderings are presented as design concepts, not manufactured products.",
    ),
    b.twoColumn(["Design Concept", "Design Concept"]),
    b.grid("Packaging concepts and iterations", 3, "natural"),

    b.heading("06", "Production Research"),
    b.paragraph(
      "Research included contacting fragrance suppliers, perfume bottle manufacturers, packaging suppliers, printing suppliers, fragrance workshops, and workshops in Grasse, France. The purpose was to evaluate price, minimum order quantity, sourcing, production feasibility, and manufacturing options.",
    ),
    b.grid("Supplier communication", 2, "natural"),

    b.heading("07", "72-Hour Creative Sprint"),
    b.paragraph("A major part of the initial brand system was created during an intensive three-day independent sprint."),
    b.timeline(
      [
        ["Day 01", "Strategy", ["Naming", "Storytelling", "Fragrance concepts", "Brand positioning"]],
        ["Day 02", "Identity", ["Logo", "Typography", "Labels", "Packaging direction", "Bottle concepts"]],
        ["Day 03", "Content", ["Campaign imagery", "Social media", "Website concept", "Video", "Digital content"]],
      ],
      "Product development, supplier research, and fragrance prototyping continued beyond the initial three-day sprint.",
    ),

    b.heading("08", "AI-Assisted Creative Direction"),
    b.paragraph(
      "Generative AI was used as a production tool rather than a substitute for creative direction. I independently curated references, developed prompts, evaluated outputs, directed revisions, and completed final image refinement and retouching.",
    ),
    b.process([
      "Reference research",
      "Reference curation",
      "Prompt development",
      "Generation",
      "Evaluation",
      "Prompt revision",
      "Multiple iterations",
      "Image selection",
      "Retouching",
      "Final visual direction",
    ]),
    b.sequence(["Reference", "Initial output", "Revision", "Retouching", "Final image"], "From reference to final image"),

    b.heading("09", "Digital Presence"),
    b.paragraph(
      "Instagram imagery, campaign content, website concepts, product upload concepts, video, motion content, and social media feed layouts.",
    ),
    b.grid("Social media feed layout", 3, "square"),
    b.video("Motion content"),
    b.link("Instagram", "", "Follow the brand on Instagram"),

    b.heading("10", "My Role"),
    b.roleTools(maisonRole, [], [
      ["Status", "In Development"],
      ["Timeline", "2026–Present"],
    ]),
  ],
});

const readerRole = [
  "Product Concept",
  "UX/UI Direction",
  "Brand Identity",
  "Feature Planning",
  "Product Requirements",
  "Competitive Research",
  "AI-Assisted Development",
];

const reader = project({
  title: "The Reader.",
  slug: "the-reader",
  subtitle: "Product Concept · UX/UI · Branding · AI-Assisted Development",
  categories: ["Product", "UX/UI", "Branding"],
  projectStatus: "In Development",
  shortDescription:
    "A minimalist bilingual e-reader designed to reduce friction between reading, dictionary lookup, and translation.",
  tags: ["Product Design", "Reading", "Language Learning"],
  role: readerRole,
  blocks: [
    b.paragraph(
      "A minimalist bilingual e-reader designed to reduce friction between reading, dictionary lookup, and translation.",
      "lead",
    ),
    b.imageFull("Current interface"),

    b.heading("01", "The Problem"),
    b.paragraph(
      "Existing reading tools often interrupt the reading experience by separating vocabulary lookup, translation, and text navigation.",
    ),

    b.heading("02", "Product Features"),
    b.paragraph(
      "TXT support\nEPUB support\nDictionary\nTranslation\nHighlighting\nBookmarks\nSaved vocabulary\nCustom fonts\nMultilingual expansion",
      "body",
      2,
    ),
    b.grid("Feature details", 3, "natural"),

    b.heading("03", "Process"),
    b.paragraph("From the initial concept through interface iterations to the current interface."),
    b.sequence(["Initial concept", "Interface iterations", "Current interface"]),

    b.heading("04", "My Role"),
    b.roleTools(readerRole, [], [
      ["Status", "In Development"],
      ["Source code", "Maintained in a private repository"],
    ]),
    b.caption("Source code is maintained in a private repository."),
  ],
});

const reselling = project({
  title: "Poshmark & eBay Reselling",
  slug: "poshmark-ebay-reselling",
  subtitle: "E-Commerce · Pricing · Merchandising · Customer Experience",
  categories: ["E-Commerce", "Pricing", "Merchandising", "Customer Experience"],
  projectStatus: "Ongoing",
  shortDescription:
    "Independently managing product selection, pricing, photography, listing optimization, customer communication, fulfillment, and post-sale service across online resale marketplaces.",
  tags: ["E-Commerce", "Marketplaces", "Merchandising"],
  role: ["Product Selection", "Pricing", "Photography", "Listing Optimization", "Customer Communication", "Fulfillment"],
  blocks: [
    b.paragraph(
      "Independently manage product selection, pricing, photography, listing optimization, customer communication, fulfillment, and post-sale service across online resale marketplaces.",
      "lead",
    ),
    // Values are empty on purpose: add real figures under /admin when ready.
    b.stats(["Items sold", "Revenue", "Active listings", "Seller rating"]),
    b.roleTools([], [], [
      ["Platforms", "Poshmark, eBay"],
      ["Product category", ""],
    ]),

    b.heading("01", "Merchandising & Listings"),
    b.paragraph("Product photography, listing presentation, and merchandising across both marketplaces."),
    b.grid("Product photos and listings", 3, "square"),

    b.heading("02", "Pricing"),
    b.paragraph("Pricing examples and how listings were positioned against comparable items."),
    b.grid("Pricing examples", 2, "natural"),

    b.heading("03", "Customer Experience"),
    b.paragraph("Customer communication, fulfillment, and post-sale service."),
    b.grid("Sales and customer experience", 2, "natural"),
  ],
});

const writing = project({
  title: "Writing & Digital Publishing",
  slug: "writing-digital-publishing",
  subtitle: "Independent Writing & Digital Publishing Project",
  categories: ["Long-form Writing", "Cover Design", "EPUB Production", "Digital Publishing"],
  projectStatus: "Independent Project",
  shortDescription:
    "An independent long-form writing project produced end to end: manuscript, cover design, EPUB production, and digital publishing.",
  tags: ["Writing", "Publishing", "EPUB", "Canva"],
  role: ["Long-form Writing", "Cover Design", "EPUB Production", "Digital Publishing"],
  tools: ["Canva"],
  blocks: [
    b.paragraph(
      "An independent long-form writing project produced end to end: manuscript, cover design, EPUB production, and digital publishing.",
      "lead",
    ),
    b.imageLarge("Manuscript cover"),

    b.heading("01", "Cover Design"),
    b.paragraph("Cover design and book mockups produced for the manuscript."),
    b.twoColumn(),

    b.heading("02", "EPUB Production"),
    b.paragraph("Screenshots and EPUB previews from the digital edition."),
    b.grid("EPUB previews", 3, "natural"),

    b.heading("03", "Excerpt"),
    b.quote(""),

    b.heading("04", "My Role"),
    b.roleTools(["Long-form Writing", "Cover Design", "EPUB Production", "Digital Publishing"], ["Canva"]),
  ],
});

const projects = [
  { id: "11111111-1111-4111-8111-000000000001", featured: true, content: maison },
  { id: "11111111-1111-4111-8111-000000000002", featured: true, content: reader },
  { id: "11111111-1111-4111-8111-000000000003", featured: false, content: reselling },
  { id: "11111111-1111-4111-8111-000000000004", featured: false, content: writing },
];

// ---------------------------------------------------------------------------
// SQL output
// ---------------------------------------------------------------------------

const lit = (value) => `'${String(value).replace(/'/g, "''")}'`;
const json = (value) => `$json$${JSON.stringify(value, null, 2)}$json$::jsonb`;

let sql = `-- ============================================================================
-- Starter content. Generated by scripts/generate-seed.mjs - edit that file and
-- re-run it instead of editing this one by hand.
--
-- Safe to run once after the schema migration. Existing rows are left alone.
-- ============================================================================

`;

sql += `update public.site_settings set\n${Object.entries(siteSettings)
  .map(([k, v]) => `  ${k} = ${lit(v)}`)
  .join(",\n")}\nwhere id = 1 and hero_headline = '';\n\n`;

sql += `update public.profile set\n${Object.entries(profile)
  .map(([k, v]) => `  ${k} = ${lit(v)}`)
  .join(",\n")}\nwhere id = 1 and name = '';\n\n`;

sql += `insert into public.education (school, college, degree, major, graduation, sort_order)\nselect * from (values\n${education
  .map((e, i) => `  (${lit(e.school)}, ${lit(e.college)}, ${lit(e.degree)}, ${lit(e.major)}, ${lit(e.graduation)}, ${i + 1})`)
  .join(",\n")}\n) as v\nwhere not exists (select 1 from public.education);\n\n`;

sql += `insert into public.social_links (label, kind, url, show_in_profile, show_in_footer, sort_order)\nselect * from (values\n${socialLinks
  .map((l, i) => `  (${lit(l.label)}, ${lit(l.kind)}, ${lit(l.url)}, ${l.show_in_profile}, ${l.show_in_footer}, ${i + 1})`)
  .join(",\n")}\n) as v\nwhere not exists (select 1 from public.social_links);\n\n`;

for (const [index, p] of projects.entries()) {
  sql += `-- ${p.content.title}\ninsert into public.projects (id, slug, status, is_featured, sort_order, content, published_at)\nvalues (${lit(p.id)}, ${lit(p.content.slug)}, 'published', ${p.featured}, ${index + 1}, ${json(p.content)}, now())\non conflict (id) do nothing;\n\n`;
  sql += `insert into public.project_drafts (project_id, content)\nvalues (${lit(p.id)}, ${json(p.content)})\non conflict (project_id) do nothing;\n\n`;
}

const out = join(__dirname, "..", "supabase", "seed.sql");
writeFileSync(out, sql);
console.log(`Wrote ${out} (${sql.length} bytes, ${projects.length} projects)`);
