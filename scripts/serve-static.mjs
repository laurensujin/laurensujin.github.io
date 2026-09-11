/**
 * Serves the exported site in `out/` the way GitHub Pages does, for checking
 * a production build locally:  node scripts/serve-static.mjs [port]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const port = Number(process.argv[2] || 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidates = [
    join(root, clean),
    join(root, clean, "index.html"),
    join(root, `${clean.replace(/\/$/, "")}.html`),
  ];
  for (const file of candidates) {
    if (file.startsWith(root) && existsSync(file) && statSync(file).isFile()) return { file, status: 200 };
  }
  return { file: join(root, "404.html"), status: 404 };
}

createServer((req, res) => {
  const { file, status } = resolve(req.url ?? "/");
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  res.writeHead(status, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving out/ at http://localhost:${port}`));
