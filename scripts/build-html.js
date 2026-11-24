import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import ejs from "ejs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const viewsDir = resolve(root, "src/views");
const pagesDir = resolve(viewsDir, "pages");

const db = JSON.parse(readFileSync(resolve(root, "api/db.json"), "utf8"));
const dict = JSON.parse(readFileSync(resolve(root, "src/i18n/en.json"), "utf8"));

const categories = db.t5_categories;
const instructors = db.t5_instructors;
const courses = db.t5_courses.map((course) => ({
  ...course,
  category: categories.find((c) => c.id === course.categoryId),
  instructor: instructors.find((i) => i.id === course.instructorId)
}));

const byId = (id) => courses.find((c) => c.id === id);

const missingKeys = new Set();

function t(key) {
  const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), dict);
  if (typeof value !== "string") {
    missingKeys.add(key);
    return key;
  }
  return value;
}

const i18n = (key) => `data-i18n="${key}"`;

const money = (value) => (value === 0 ? t("common.free") : `$${value}`);
const number = (value) => value.toLocaleString("en-US");
const img = (path) => `./src/assets/images/${path}`;

const helpers = { t, i18n, money, number, img };

const pages = {
  index: { page: "home", title: t("meta.home.title"), description: t("meta.home.description"),
    categories: categories.slice(0, 4), popular: [byId(1), byId(2), byId(3)] },
  courses: { page: "courses", title: t("meta.courses.title"), description: t("meta.courses.description"),
    categories, courses },
  course: { page: "course", title: t("meta.course.title"), description: t("meta.course.description"),
    course: byId(1), modules: db.t5_modules.filter((m) => m.courseId === 1),
    reviews: db.t5_reviews.filter((r) => r.courseId === 1), related: [byId(2), byId(5)] },
  enroll: { page: "enroll", title: t("meta.enroll.title"), description: t("meta.enroll.description"),
    course: byId(1), plans: db.t5_plans }
};

const files = readdirSync(pagesDir).filter((f) => f.endsWith(".ejs"));

for (const file of files) {
  const name = basename(file, ".ejs");
  const data = { ...helpers, ...pages[name] };
  const html = await ejs.renderFile(resolve(pagesDir, file), data, { root: viewsDir });
  writeFileSync(resolve(root, `${name}.html`), html);
  console.log(`✓ ${name}.html`);
}

if (missingKeys.size) {
  console.error(`✗ Missing i18n keys: ${[...missingKeys].join(", ")}`);
  process.exit(1);
}
