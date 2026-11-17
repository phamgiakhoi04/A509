import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { generatePages } from "../scripts/generate-pages.mjs";
import { addPagesPolicy, releaseConfig } from "../scripts/pages-release.mjs";

test("normalizes the configured API and site paths", () => {
  const { api, site } = releaseConfig({
    VITE_API_BASE_URL: "https://api.example.com/gateway/api/",
    VITE_SITE_URL: "https://example.com/A509",
  });
  assert.equal(api.href, "https://api.example.com/gateway/");
  assert.equal(site.href, "https://example.com/A509/");
});

test("a Pages release requires an explicit, public, credential-free HTTPS API URL", () => {
  for (const candidate of [
    undefined,
    "http://api.example.com",
    "https://localhost:8080",
    "https://127.0.0.1",
    "https://user:secret@api.example.com",
    "https://api.example.com/?token=secret",
  ]) {
    assert.throws(() => releaseConfig({ VITE_API_BASE_URL: candidate }), /VITE_API_BASE_URL/);
  }
});

test("the Pages policy runs before scripts and grants access to the configured API", () => {
  const page = '<html><head><meta charset="UTF-8"><script src="/A509/assets/app.js"></script></head></html>';
  const secured = addPagesPolicy(page, "https://api.example.com");
  assert(secured.indexOf("Content-Security-Policy") < secured.indexOf("<script"));
  assert.match(secured, /connect-src 'self' https:\/\/api\.example\.com/);
  assert.match(secured, /script-src 'self'/);
  assert.equal(addPagesPolicy(secured, "https://api.example.com"), secured);
});

test("generated Pages publish links and metadata for public content without copying the full article", async (t) => {
  const dist = await mkdtemp(join(tmpdir(), "a509-pages-"));
  t.after(() => rm(dist, { recursive: true, force: true }));
  await writeFile(join(dist, "index.html"), `
    <meta charset="UTF-8"><!-- a509-seo-start --><title>A509</title><!-- a509-seo-end -->
    <script type="module" src="/A509/assets/app.js"></script><div id="root"></div>
  `);
  const articles = [
    {
      slug: "bai-cong-khai", status: "PUBLISHED", title: "A509 & tư liệu", excerpt: "Tóm tắt bài viết.",
      content: "Nội dung đầy đủ chỉ nằm trong API.",
      thumbnailSensitive: true, thumbnailUrl: "https://img.example.com/protected.jpg",
    },
    { slug: "ban-nhap", status: "DRAFT", title: "Nội dung nháp" },
    { slug: "da-xoa", status: "PUBLISHED", title: "Đã xóa", deletedAt: "2026-10-01T12:00:00Z" },
  ];
  await generatePages({
    dist,
    env: { VITE_BASE: "/A509/", VITE_API_BASE_URL: "https://api.example.com/api" },
    fetchImpl: async (url) => {
      const path = new URL(url).pathname;
      if (path === "/api/articles") return Response.json(articles);
      if (path === "/api/uniforms") return Response.json({ content: [], totalPages: 0 });
      return Response.json([]);
    },
  });
  const article = await readFile(join(dist, "tin-tuc", "bai-cong-khai", "index.html"), "utf8");
  assert.match(article, /A509 &amp; tư liệu/);
  assert.match(article, /<link rel="canonical" href="[^"]+\/tin-tuc\/bai-cong-khai\/"/);
  assert(!article.includes("Nội dung đầy đủ"));
  assert(!article.includes("protected.jpg"));
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  assert.match(sitemap, /\/tin-tuc\/bai-cong-khai\//);
  assert.doesNotMatch(sitemap, /ban-nhap|da-xoa|\/admin\/|\/reset-password\//);
  const missing = await readFile(join(dist, "404.html"), "utf8");
  assert.match(missing, /name="robots" content="noindex, follow"/);
});
