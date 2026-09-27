/**
 * Static guard for our @clerk/nextjs usage. Clerk Core 3 (v7) REMOVED the
 * SignedIn / SignedOut / Protect control components (they are still "exported" but
 * only as runtime-throwing stubs). This test scans our own source for every named
 * import from `@clerk/nextjs` and `@clerk/nextjs/server` and asserts:
 *   1. each imported name is actually exported by the installed package d.ts, and
 *   2. none of them is one of the removed control components.
 *
 * It fails the build if anyone reintroduces a removed component or mistypes an import.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../../../..");
const SRC = join(ROOT, "src");
const REMOVED = ["SignedIn", "SignedOut", "Protect"] as const;

const CLIENT_DTS = join(ROOT, "node_modules/@clerk/nextjs/dist/types/index.d.ts");
const SERVER_DTS = join(ROOT, "node_modules/@clerk/nextjs/dist/types/server/index.d.ts");

/** Every identifier the d.ts exposes (from `export { … }` and `export declare X`). */
function exportedNames(dtsPath: string): Set<string> {
  const text = readFileSync(dtsPath, "utf8");
  const names = new Set<string>();
  for (const m of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.replace(/\btype\b/, "").trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(name);
    }
  }
  for (const m of text.matchAll(/export\s+declare\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g)) {
    names.add(m[1]);
  }
  return names;
}

/** Recursively collect .ts/.tsx files under `dir`. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...sourceFiles(p));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(p);
  }
  return out;
}

/** Named identifiers imported from `spec` (static `import {}` or dynamic `import()`). */
function importedFrom(text: string, spec: string): string[] {
  const names: string[] = [];
  const esc = spec.replace(/[/]/g, "\\/");
  // Static: import { a, b } from "spec"
  for (const m of text.matchAll(new RegExp(`import\\s*\\{([^{}]*)\\}\\s*from\\s*["']${esc}["']`, "g"))) {
    for (const raw of m[1].split(",")) {
      const n = raw.replace(/\btype\b/, "").trim().split(/\s+as\s+/)[0].trim();
      if (n) names.push(n);
    }
  }
  // Dynamic: const { auth } = await import("spec")
  for (const m of text.matchAll(new RegExp(`\\{([^{}]*)\\}\\s*=\\s*await\\s+import\\(\\s*["']${esc}["']`, "g"))) {
    for (const raw of m[1].split(",")) {
      const n = raw.trim().split(/\s*:\s*/)[0].trim();
      if (n) names.push(n);
    }
  }
  return names;
}

describe("@clerk/nextjs imports", () => {
  const files = sourceFiles(SRC);
  const clientExports = exportedNames(CLIENT_DTS);
  const serverExports = exportedNames(SERVER_DTS);

  it("every imported name exists in the installed package d.ts", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const name of importedFrom(text, "@clerk/nextjs")) {
        expect(clientExports, `${name} imported in ${file}`).toContain(name);
      }
      for (const name of importedFrom(text, "@clerk/nextjs/server")) {
        expect(serverExports, `${name} imported in ${file}`).toContain(name);
      }
    }
  });

  it("imports none of the removed control components (SignedIn/SignedOut/Protect)", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const used = [
        ...importedFrom(text, "@clerk/nextjs"),
        ...importedFrom(text, "@clerk/nextjs/server"),
      ];
      for (const removed of REMOVED) {
        expect(used, `${removed} must not be imported (${file})`).not.toContain(removed);
      }
    }
  });

  it("confirms the removed components are the ones Core 3 stripped", () => {
    // Sanity: they ARE still present as named exports (as throwing stubs), which is
    // exactly why a name-existence check alone is insufficient — hence test #2.
    for (const removed of REMOVED) expect(clientExports).toContain(removed);
  });
});
