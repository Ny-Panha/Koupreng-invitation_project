// Deterministic derivatives of existing repository artwork, never new artwork.
// Run from apps/frontend-user against its local preview. No remote URLs or APIs.
import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const sources = [
  { source: "/facebook/all/06-card/cover-card.jpg", name: "khmer-celestial", widths: [320, 640, 1280] },
  { source: "/templates/canva-luxury/emerald-luxury.jpg", name: "emerald-luxe", widths: [240, 480, 768] },
];
const destination = "public/images/marketing/catalog";
await mkdir(destination, { recursive: true });
const browser = await chromium.launch();
const manifest = [];
try {
  const page = await browser.newPage();
  await page.route("http://127.0.0.1:4173/", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Local derivative generator</title>" }));
  await page.goto("http://127.0.0.1:4173/");
  for (const { source, name, widths } of sources) {
    const original = await readFile(`public${source}`);
    for (const width of widths) {
      const base64 = await page.evaluate(async ({ source, width }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = Math.round(width * image.naturalHeight / image.naturalWidth);
        const context = canvas.getContext("2d");
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/webp", 0.88).split(",")[1];
      }, { source, width });
      const file = `${name}-${width}.webp`;
      const bytes = Buffer.from(base64, "base64");
      await writeFile(`${destination}/${file}`, bytes);
      manifest.push({ source, sourceSha256: createHash("sha256").update(original).digest("hex"), file, width, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
    }
  }
} finally { await browser.close(); }
await writeFile(`${destination}/provenance.json`, JSON.stringify({ generator: "generate-marketing-thumbnails.mjs; Chromium canvas WebP quality 0.88; unchanged aspect ratio, no crop or enlargement", chromium: browser.version(), assets: manifest }, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
