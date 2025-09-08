// scripts/generate-sitemap.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === EDIT THIS to your real domain ===
const SITE_URL = process.env.SITE_URL || "https://www.example.com";

const GALLERY_DIR = path.join(__dirname, "..", "public", "gallery");
const PUBLIC_DIR  = path.join(__dirname, "..", "public");
const OUT_FILE    = path.join(PUBLIC_DIR, "sitemap.xml");

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const allow = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
  return fs.readdirSync(dir).filter(f => allow.has(path.extname(f).toLowerCase())).sort();
}

const images = listImages(GALLERY_DIR);
const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${images.map(f => `    <image:image>
      <image:loc>${SITE_URL}/gallery/${encodeURIComponent(f)}</image:loc>
      <image:title>${path.parse(f).name}</image:title>
    </image:image>`).join("\n")}
  </url>
</urlset>
`;

fs.writeFileSync(OUT_FILE, xml.trim() + "\n", "utf8");
console.log(`✅ sitemap.xml generated with ${images.length} images → ${OUT_FILE}`);
