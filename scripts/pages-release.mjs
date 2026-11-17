import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import catalog from "../src/seo/pages.json" with { type: "json" };

function httpsUrl(input, key) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error(key + " must be an absolute HTTPS URL.");
  }
  const localhost = /^(localhost|.+\.localhost|127\..*|0\.0\.0\.0|\[::1\])$/i;
  assert(
    url.protocol === "https:" &&
      !localhost.test(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash,
    key + " must use public HTTPS without credentials, a query or a fragment.",
  );
  return url;
}

export function releaseConfig(env = process.env) {
  const api = httpsUrl(env.VITE_API_URL || env.VITE_API_BASE_URL, "VITE_API_BASE_URL");
  const site = httpsUrl(env.VITE_SITE_URL || catalog.defaultSiteUrl, "VITE_SITE_URL");
  api.pathname = api.pathname.replace(/\/+$/, "").replace(/\/api$/, "") + "/";
  site.pathname = site.pathname.replace(/\/+$/, "") + "/";
  return { api, site };
}

export function addPagesPolicy(html, apiOrigin) {
  const policy = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' " + apiOrigin,
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
  const policyTag = '<meta http-equiv="Content-Security-Policy" content="' + policy + '">';
  if (html.includes(policyTag)) return html;

  const charset = /<meta\s+charset\s*=\s*["']?utf-8["']?\s*\/?>/i;
  assert(charset.test(html), "Expected a UTF-8 declaration in generated HTML.");
  return html.replace(charset, (tag) => tag + "\n    " + policyTag);
}

async function protectPages(directory, apiOrigin) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await protectPages(path, apiOrigin);
    else if (entry.isFile() && (entry.name === "index.html" || entry.name === "404.html")) {
      const html = await readFile(path, "utf8");
      await writeFile(path, addPagesPolicy(html, apiOrigin));
    }
  }
}

function request(base, path, options) {
  return fetch(new URL(path, base), {
    ...options,
    signal: AbortSignal.timeout(25000),
  });
}

async function checkApi({ api, site }) {
  const [health, categories, preflight, foreign, admin] = await Promise.all([
    request(api, "api/health"),
    request(api, "api/categories", { headers: { Origin: site.origin } }),
    request(api, "api/categories", {
      method: "OPTIONS",
      headers: {
        Origin: site.origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "x-a509-language",
      },
    }),
    request(api, "api/categories", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.invalid",
        "Access-Control-Request-Method": "GET",
      },
    }),
    request(api, "api/admin/overview"),
  ]);

  assert(health.ok && (await health.json()).status === "UP", "Backend health check failed.");
  assert(categories.ok && Array.isArray(await categories.json()), "Backend could not read categories from the database.");
  assert.equal(categories.headers.get("access-control-allow-origin"), site.origin, "Backend did not allow the frontend origin.");
  assert(preflight.ok, "Backend rejected the frontend preflight request.");
  assert.equal(preflight.headers.get("access-control-allow-origin"), site.origin, "Preflight did not allow the frontend origin.");
  assert.match(preflight.headers.get("access-control-allow-headers") || "", /\bx-a509-language\b/i);
  assert(!foreign.headers.has("access-control-allow-origin"), "CORS allowed an unrelated origin.");
  assert.equal(admin.status, 401, "Anonymous access to the Admin API must return HTTP 401.");
  console.log("Backend health, database, CORS and Admin access checks passed.");
}

async function checkSite({ api, site }) {
  const routes = ["", "tin-tuc", "tai-lieu/", "lien-he/"];
  for (const route of routes) {
    const response = await request(site, route);
    assert.equal(response.status, 200, route + " did not return HTTP 200.");
    const html = await response.text();
    assert.match(html, /name="description"/i);
    assert.match(html, /rel="canonical"/i);
    assert.match(html, /property="og:title"/i);
    assert.match(html, /http-equiv="Content-Security-Policy"/i);
    assert(html.includes("connect-src 'self' " + api.origin), "Published CSP does not allow the configured backend.");
  }

  const sitemap = await request(site, "sitemap.xml");
  assert(sitemap.ok, "Sitemap is unavailable.");
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /<urlset\b/);
  assert(sitemapXml.includes(new URL("tin-tuc/", site).href), "Sitemap is missing the news page.");
  assert(!/\/(?:admin|reset-password)\//.test(sitemapXml), "Private routes are listed in the sitemap.");
  const robots = await request(site, "robots.txt");
  assert(robots.ok && (await robots.text()).includes(new URL("sitemap.xml", site).href),
    "Project robots.txt does not reference the sitemap.");
  const missing = await request(site, "a509-release-check-not-found/");
  assert.equal(missing.status, 404, "An unknown URL must return HTTP 404.");
  assert.match(await missing.text(), /name="robots"[^>]*noindex/i);
  console.log("Published page URLs, metadata, CSP, sitemap and 404 checks passed.");
}

async function retryCheck(check, attempts) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await check();
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      await delay(5000);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2];
  const config = releaseConfig();
  if (mode === "api") await retryCheck(() => checkApi(config), 3);
  else if (mode === "protect") await protectPages("dist", config.api.origin);
  else if (mode === "published") {
    await retryCheck(() => checkSite(config), 10);
    await retryCheck(() => checkApi(config), 3);
  }
  else throw new Error("Expected release check mode: api, protect or published.");
}
