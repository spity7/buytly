import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(scriptDir, "..", "src", "app");
const siteSuffix = /\s*\|\s*Buytly\s*$/i;

const TITLE_MAP = {
  "Home v1": "__HOME__",
  "Home v2": "Home",
  "Home v3": "Home",
  "Home v4": "Home",
  "Home v5": "Home",
  "Home v6": "Home",
  "Home v7": "Home",
  "Home v8": "Home",
  "Home v9": "Home",
  "Home v10": "Home",
  "Property Single V1": "Property Details",
  "Property Single V2": "Property Details",
  "Property Single V3": "Property Details",
  "Property Single V4": "Property Details",
  "Property Single V5": "Property Details",
  "Property Single V6": "Property Details",
  "Property Single V7": "Property Details",
  "Property Single V8": "Property Details",
  "Property Single V9": "Property Details",
  "Property Single V10": "Property Details",
  "Map V1": "Map Search",
  "Map V2": "Map Search",
  "Map V3": "Map Search",
  "Map V4": "Map Search",
  "Header Map Style": "Map Search",
  "List V1": "Property List",
  "Gird Full 1 Column V1": "Browse Properties",
  "Gird Full 1 Column V2": "Browse Properties",
  "Gird Full 2 Column": "Browse Properties",
  "Gird Full 3 Column": "Browse Properties",
  "Banner Search V1": "Search Properties",
  "Banner Search V2": "Search Properties",
  "Blog List v1 ": "Blog",
  "Blog List v2 ": "Blog",
  "Blog List v3 ": "Blog",
  "Blog Single ": "Blog Post",
  "Agency Single": "Agency",
  "Agent Single": "Agent Profile",
  "Dashboard Home": "Dashboard",
  "Dashboard Message": "Messages",
  "Dashboard My Package": "My Package",
  "Dashboard My Favourites": "Saved Listings",
  "Dashboard Properties": "My Properties",
  "Dashboard Reviews": "Reviews",
  "Not-Found ": "Page Not Found",
  "Contact ": "Contact",
  "About ": "About Us",
  "Pricing ": "Pricing",
  "Faq ": "FAQ",
  "Compare ": "Compare Listings",
  Project: "Project Details",
  "Browse Properties | Buytly": "Browse Properties",
  "Map View": "Map Search",
  Projects: "Browse Projects",
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name === "page.js") out.push(full);
  }
  return out;
}

function resolveTitle(raw) {
  let t = raw.replace(siteSuffix, "").trim();
  if (TITLE_MAP[raw] != null) return TITLE_MAP[raw];
  if (TITLE_MAP[t] != null) return TITLE_MAP[t];
  return t;
}

function ensureImport(src, helpers) {
  const importLine = `import { ${helpers.join(", ")} } from "@/lib/siteMetadata";`;
  if (src.includes("@/lib/siteMetadata")) return src;
  const lines = src.split("\n");
  let insertAt = 0;
  while (insertAt < lines.length && lines[insertAt].startsWith("import ")) {
    insertAt += 1;
  }
  lines.splice(insertAt, 0, importLine);
  return lines.join("\n");
}

function buildExport(resolved, description) {
  const helper = resolved === "__HOME__" ? "homePageMetadata" : "pageMetadata";
  if (resolved === "__HOME__") {
    if (description) {
      return `export const metadata = homePageMetadata(${JSON.stringify({ description })});`;
    }
    return "export const metadata = homePageMetadata();";
  }
  if (description) {
    return `export const metadata = pageMetadata(${JSON.stringify(resolved)}, ${JSON.stringify({ description })});`;
  }
  return `export const metadata = pageMetadata(${JSON.stringify(resolved)});`;
}

function patchFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");

  const withDesc = src.match(
    /export const metadata = \{\s*\n\s*title:\s*"([^"]*)"\s*,\s*\n\s*description:\s*"([^"]*)"\s*,?\s*\n\s*\};/,
  );
  if (withDesc) {
    const resolved = resolveTitle(withDesc[1]);
    const helpers =
      resolved === "__HOME__" ? ["homePageMetadata"] : ["pageMetadata"];
    src = src.replace(withDesc[0], buildExport(resolved, withDesc[2]));
    src = ensureImport(src, helpers);
    fs.writeFileSync(filePath, src, "utf8");
    return true;
  }

  const simple = src.match(
    /export const metadata = \{\s*\n\s*title:\s*"([^"]*)"\s*,?\s*\n\s*\};/,
  );
  if (!simple) return false;

  const resolved = resolveTitle(simple[1]);
  const helpers =
    resolved === "__HOME__" ? ["homePageMetadata"] : ["pageMetadata"];
  src = src.replace(simple[0], buildExport(resolved));
  src = ensureImport(src, helpers);
  fs.writeFileSync(filePath, src, "utf8");
  return true;
}

let updated = 0;
for (const file of walk(appDir)) {
  if (patchFile(file)) updated += 1;
}
console.log(`Updated metadata in ${updated} page(s).`);
