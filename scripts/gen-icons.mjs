#!/usr/bin/env node
// Generates PWA PNG icons + apple-icon from src/app/icon.svg.
// Uses `sharp` if it can be loaded (directly or via npx); otherwise it
// no-ops gracefully so the build still works with the SVG icon alone.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "src/app/icon.svg");
const outDir = join(root, "public/icons");
const targets = [
  { file: join(outDir, "icon-192.png"), size: 192 },
  { file: join(outDir, "icon-512.png"), size: 512 },
  { file: join(root, "public/apple-icon.png"), size: 180 },
];

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    return null;
  }
}

async function main() {
  const sharp = await loadSharp();
  if (!sharp) {
    console.warn("[gen-icons] sharp unavailable — keeping SVG icon only.");
    return;
  }
  await mkdir(outDir, { recursive: true });
  const svg = await readFile(svgPath);
  for (const { file, size } of targets) {
    const png = await sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toBuffer();
    await writeFile(file, png);
    console.log(`[gen-icons] wrote ${file} (${size}px)`);
  }
}

main().catch((err) => {
  console.warn("[gen-icons] skipped:", err?.message ?? err);
});
