import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import catalog from "../src/seo/pages.json" with { type: "json" };
import { releaseConfig } from "./pages-release.mjs";

const seoMarker = /<!-- a509-seo-start -->[\s\S]*?<!-- a509-seo-end -->/;
const rootMarker = '<div id="root"></div>';
const reservedArticleSlugs = new Set(["admin", "category", "featured", "images", "latest"]);
const navigation = ["/gioi-thieu", "/tin-tuc", "/hoat-dong/phuc-dung", "/tai-lieu", "/lien-he"];
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function text(value) {
  return typeof value === "string" ? value.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim() : "";
}

function publicText(value) {
  if (typeof value !== "string") return "";
  if (!value.startsWith("<!--a509-rich-text:v1-->")) return text(value);
  return text(value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(?:\/p|\/div|\/h[1-6]|\/li|br)\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#(?:x[\da-f]+|\d+)|[a-z]+);/gi, (match, entity) => {
      if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? match;
      const number = /^#x/i.test(entity) ? Number.parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
        ? String.fromCodePoint(number)
        : "";
    }));
}

function description(value) {
  const letters = Array.from(value);
  if (letters.length <= 157) return value;
  const prefix = letters.slice(0, 157).join("");
  const boundary = prefix.lastIndexOf(" ");
  return (boundary > 120 ? prefix.slice(0, boundary) : prefix) + "…";
}

function safeSegment(value) {
  return typeof value === "string" &&
    /^[\p{L}\p{N}](?:[\p{L}\p{N}_~-]|\.(?!$)){0,155}$/u.test(value);
}

function slugify(value) {
  return text(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readConfig(env) {
  const { site, api } = releaseConfig(env);
  if ((env.VITE_BASE || "/") !== site.pathname) {
    throw new Error(`VITE_BASE must match the canonical site path ${site.pathname}.`);
  }
  return { site, apiBase: api.href.replace(/\/$/, "") };
}

async function loadPublicData(apiBase, fetchImpl) {
  async function request(endpoint) {
    const response = await fetchImpl(apiBase + endpoint, {
      headers: { Accept: "application/json", "X-A509-Language": "vi" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Public API ${endpoint} returned HTTP ${response.status}.`);
    return response.json();
  }
  async function rows(endpoint) {
    const result = await request(endpoint);
    if (!Array.isArray(result)) throw new Error(`Public API ${endpoint} did not return a list.`);
    return result;
  }
  async function allUniforms() {
    const result = [];
    for (let page = 0; ; page++) {
      const response = await request(`/api/uniforms?page=${page}&size=50`);
      if (!Array.isArray(response.content) ||
        !Number.isSafeInteger(response.totalPages) || response.totalPages < 0) {
        throw new Error("Public API /api/uniforms did not return a valid page.");
      }
      result.push(...response.content);
      if (page + 1 >= response.totalPages) return result;
      if (page >= 999) throw new Error("Public API /api/uniforms exceeds the page limit.");
    }
  }
  return Promise.all([
    rows("/api/articles"),
    allUniforms(),
    rows("/api/countries"),
    rows("/api/uniform-categories/roots/REENACTMENT"),
  ]);
}

function publicImage(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function isoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value)) ? value : undefined;
}

function contentPages([articles, uniforms, countries, reenactmentRoots]) {
  const pages = new Map(Object.entries(catalog.pages));
  const newsLinks = [];
  for (const article of articles) {
    if (article?.status !== "PUBLISHED" || article.deletedAt != null || !safeSegment(article.slug) ||
      reservedArticleSlugs.has(article.slug.toLowerCase()) || !text(article.title)) continue;
    const route = `/tin-tuc/${article.slug}`;
    if (pages.has(route) || Object.hasOwn(catalog.aliases, route)) continue;
    const body = publicText(article.content);
    pages.set(route, {
      title: text(article.title),
      description: description(text(article.excerpt) || body || catalog.pages["/tin-tuc"].description),
      image: article.thumbnailSensitive === false ? publicImage(article.thumbnailUrl) : undefined,
      author: text(article.authorName),
      published: isoDate(article.publishedAt),
      modified: isoDate(article.updatedAt),
      type: "article",
    });
    newsLinks.push(route);
  }
  pages.set("/", { ...pages.get("/"), links: newsLinks.slice(0, 6) });
  pages.set("/tin-tuc", {
    ...pages.get("/tin-tuc"),
    links: ["/tin-tuc/thoi-su", "/tin-tuc/phong-su", ...newsLinks.slice(0, 12)],
  });

  const uniformLinks = [];
  for (const uniform of uniforms) {
    if (!Number.isSafeInteger(uniform?.id) || uniform.id < 1 || !text(uniform.name)) continue;
    const route = `/tai-lieu/quan-trang/${uniform.id}`;
    if (pages.has(route)) continue;
    const image = Array.isArray(uniform.images)
      ? uniform.images.find((image) => image?.sensitive === false && publicImage(image.imageUrl))
      : undefined;
    const body = publicText(uniform.history);
    pages.set(route, {
      title: text(uniform.name),
      description: description(text(uniform.description) || body || catalog.pages["/tai-lieu/quan-trang"].description),
      image: publicImage(image?.imageUrl),
      modified: isoDate(uniform.updatedAt),
    });
    pages.set(`/quan-trang/trang-bi/${uniform.id}`, {
      ...pages.get(route), canonicalPath: route, noindex: true,
    });
    uniformLinks.push(route);
  }
  pages.set("/tai-lieu/quan-trang", { ...pages.get("/tai-lieu/quan-trang"), links: uniformLinks.slice(0, 20) });
  pages.set("/tai-lieu", {
    ...pages.get("/tai-lieu"),
    links: [...pages.keys()].filter((route) => /^\/tai-lieu\/[^/]+$/.test(route)),
  });

  const recon = "/hoat-dong/phuc-dung";
  const root = reenactmentRoots.find((item) =>
    slugify(item?.sourceName || item?.categoryName) === "phuc-dung-trang-phuc") || reenactmentRoots[0];
  const regionLinks = [];
  for (const country of countries) {
    const countrySlug = slugify(country?.sourceName || country?.countryName);
    const countryName = text(country?.countryName);
    if (!safeSegment(countrySlug) || !countryName) continue;
    const region = `${recon}/${countrySlug}`;
    if (pages.has(region)) continue;
    regionLinks.push(region);
    const unitLinks = [];
    pages.set(region, {
      title: `Phục dựng trang phục ${countryName}`,
      description: description(text(country.description) || `Tư liệu phục dựng trang phục lịch sử của ${countryName}.`),
      links: unitLinks,
    });
    for (const unit of root?.children || []) {
      if (Number(unit?.countryId) !== Number(country.id)) continue;
      const unitSlug = slugify(unit.sourceName || unit.categoryName);
      const unitName = text(unit.categoryName);
      if (!safeSegment(unitSlug) || !unitName) continue;
      const unitRoute = `${region}/${unitSlug}`;
      if (pages.has(unitRoute)) continue;
      unitLinks.push(unitRoute);
      const periodLinks = [];
      pages.set(unitRoute, {
        title: unitName,
        description: description(text(unit.description) || `Các giai đoạn và tư liệu phục dựng của ${unitName}, ${countryName}.`),
        links: periodLinks,
      });
      for (const period of unit.children || []) {
        const periodSlug = period?.slug || slugify(period?.sourceName || period?.categoryName);
        const periodName = text(period?.categoryName);
        if (!safeSegment(periodSlug) || !periodName) continue;
        const periodRoute = `${unitRoute}/${periodSlug}`;
        if (pages.has(periodRoute)) continue;
        periodLinks.push(periodRoute);
        pages.set(periodRoute, {
          title: periodName,
          description: description(text(period.description) || `Tư liệu phục dựng ${unitName} trong giai đoạn ${periodName}.`),
        });
      }
    }
  }
  pages.set(recon, { ...pages.get(recon), links: regionLinks });
  for (const [route, page] of Array.from(pages)) {
    if (route.startsWith(`${recon}/`)) {
      pages.set(route.replace(recon, "/phuc-dung"), { ...page, canonicalPath: route, noindex: true });
    }
  }
  for (const [alias, canonicalPath] of Object.entries(catalog.aliases)) {
    pages.set(alias, { ...pages.get(canonicalPath), canonicalPath, noindex: true });
  }
  for (const admin of catalog.adminPages) {
    pages.set(admin, { title: "Quản trị", description: "Trang quản trị A509.", noindex: true });
  }
  return pages;
}

function siteUrl(site, route) {
  return new URL(route === "/" ? "" : `${route.slice(1)}/`, site).href;
}

function renderHead({ page, route, site }) {
  const canonical = page.canonicalPath || (!page.noindex ? route : undefined);
  const url = canonical ? siteUrl(site, canonical) : undefined;
  const title = route === "/" ? `A509 | ${page.title}` : `${page.title} | A509`;
  const image = page.image || new URL(catalog.imagePath, site).href;
  const meta = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(page.description)}">`,
    page.noindex ? '<meta name="robots" content="noindex, follow">' : "",
    page.notFound ? '<meta name="a509-page" content="not-found">' : "",
    url ? `<link rel="canonical" href="${escape(url)}">` : "",
    ...(url ? [
      `<meta property="og:site_name" content="${escape(catalog.siteName)}">`,
      `<meta property="og:type" content="${page.type || "website"}">`,
      '<meta property="og:locale" content="vi_VN">',
      `<meta property="og:title" content="${escape(title)}">`,
      `<meta property="og:description" content="${escape(page.description)}">`,
      `<meta property="og:url" content="${escape(url)}">`,
      `<meta property="og:image" content="${escape(image)}">`,
      '<meta name="twitter:card" content="summary_large_image">',
    ] : []),
  ];
  if (url && !page.noindex && (page.type === "article" || route === "/")) {
    const schema = page.type === "article" ? {
      "@type": "Article",
      headline: page.title,
      description: page.description,
      datePublished: page.published,
      dateModified: page.modified,
      image: page.image,
      mainEntityOfPage: url,
      author: page.author ? { "@type": "Person", name: page.author } : { "@type": "Organization", name: catalog.siteName },
      publisher: { "@type": "Organization", name: catalog.siteName, url: site.href },
    } : { "@type": "WebSite", name: catalog.siteName, alternateName: "A509", url };
    const json = JSON.stringify({ "@context": "https://schema.org", ...schema, inLanguage: "vi" })
      .replace(/</g, "\\u003c");
    meta.push(`<script type="application/ld+json">${json}</script>`);
  }
  return meta.filter(Boolean).join("\n    ");
}

function snapshot({ page, pages, site }) {
  if (page.noindex && !page.canonicalPath && !page.notFound) return "";
  const link = (route) => `<a class="underline" href="${escape(siteUrl(site, route))}">${escape(pages.get(route).title)}</a>`;
  const related = (page.links || []).map((route) => `<li>${link(route)}</li>`).join("");
  const nav = (page.notFound ? ["/", ...navigation] : navigation).map(link).join(" ");
  return `<main class="mx-auto max-w-4xl p-6"><h1 class="text-3xl font-bold">${escape(page.title)}</h1>` +
    `<p class="mt-4 leading-relaxed">${escape(page.description)}</p>` +
    (related ? `<ul class="mt-6 space-y-2">${related}</ul>` : "") +
    `<nav aria-label="A509" class="mt-8 flex flex-wrap gap-4">${nav}</nav></main>`;
}

export async function generatePages({ env = process.env, dist = "dist", fetchImpl = fetch } = {}) {
  const { site, apiBase } = readConfig(env);
  const template = await readFile(path.join(dist, "index.html"), "utf8");
  if (!seoMarker.test(template) || !template.includes(rootMarker) ||
    !template.includes(`src="${site.pathname}assets/`)) {
    throw new Error("Unexpected Vite HTML template or base path. Build with VITE_BASE before generating Pages.");
  }
  const pages = contentPages(await loadPublicData(apiBase, fetchImpl));
  const routes = new Set();
  for (const route of pages.keys()) {
    const normalized = route.toLowerCase();
    if (routes.has(normalized)) throw new Error(`Duplicate route under case-insensitive paths: ${route}.`);
    routes.add(normalized);
  }
  const render = (route, page) => {
    const view = { route, page, pages, site };
    return template.replace(seoMarker, () => renderHead(view))
      .replace(rootMarker, () => `<div id="root">${snapshot(view)}</div>`);
  };
  for (const [route, page] of pages) {
    const directory = path.join(dist, ...route.split("/").filter(Boolean));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), render(route, page));
  }
  await writeFile(path.join(dist, "404.html"), render("/404", {
    title: "Không tìm thấy trang",
    description: "Trang bạn mở không tồn tại. Hãy trở về trang chủ hoặc chọn một chuyên mục của A509.",
    noindex: true,
    notFound: true,
  }));
  const indexable = [...pages].filter(([, page]) => !page.noindex);
  const links = indexable.map(([route, page]) => {
    const lastModified = page.modified || page.published;
    return `  <url><loc>${escape(siteUrl(site, route))}</loc>` +
      (lastModified ? `<lastmod>${lastModified.slice(0, 10)}</lastmod>` : "") + "</url>";
  }).join("\n");
  const sitemap = new URL("sitemap.xml", site).href;
  await writeFile(path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${links}\n</urlset>\n`);
  await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`);
  return { pageCount: pages.size, indexedCount: indexable.length, sitemap };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { pageCount, indexedCount, sitemap } = await generatePages();
    console.log(`Generated ${pageCount} HTML pages, of which ${indexedCount} are in ${sitemap}`);
  } catch (error) {
    console.error(`Pages build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
