import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "courses.html", "course.html", "enroll.html"];
const html = Object.fromEntries(pages.map((p) => [p, readFileSync(resolve(root, p), "utf8")]));
const ids = (page) => new Set([...html[page].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const errors = [];
let checked = 0;

for (const page of pages) {
  const urls = [
    ...[...html[page].matchAll(/\s(?:href|src|action)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html[page].matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0]))
  ];
  for (const url of urls) {
    if (/^(https?:|mailto:|tel:)/.test(url)) {
      continue;
    }
    checked++;
    const [pathAndQuery, hash] = url.split("#");
    const path = pathAndQuery.split("?")[0];
    const target = path === "" ? page : path.replace(/^\.\//, "");
    if (!existsSync(resolve(root, target))) {
      errors.push(`${page}: missing file ${url}`);
      continue;
    }
    if (hash && html[target] && !ids(target).has(hash)) {
      errors.push(`${page}: missing anchor #${hash} in ${target}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`✓ ${checked} relative links checked, no broken links`);
