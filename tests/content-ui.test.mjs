import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

async function moduleUrl(relative, replacements = {}) {
  const source = await readFile(new URL(`../src/${relative}`, import.meta.url), "utf8");
  let code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  code = code.replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")));
  for (const [from, to] of Object.entries(replacements)) code = code.replaceAll(JSON.stringify(from), JSON.stringify(to));
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
const scope = await import(await moduleUrl("utils/contentSections.ts"));
const {apiError} = await import(await moduleUrl("utils/apiError.ts"));
test("structured API errors remain renderable strings in admin", () => {
  assert.equal(apiError({response:{data:{status:500,error:"Internal Server Error"}}},"Không thể tải"),"Không thể tải");
  assert.equal(apiError({response:{data:"Không thể tự khóa tài khoản"}},"Lỗi"),"Không thể tự khóa tài khoản");
  assert.equal(apiError({response:{data:{detail:"Không hợp lệ"}}},"Lỗi"),"Không hợp lệ");
});
const categories = [
  { id:1, slug:"tin-tuc", name:"Tin tức" }, { id:2, slug:"thoi-su", name:"Thời sự", parentId:1 },
  { id:3, slug:"tai-lieu", name:"Tài liệu" }, { id:4, slug:"thu-vien", name:"Thư viện", parentId:3 },
  { id:5, slug:"kham-pha", name:"Khám phá" }, { id:6, slug:"cac-van-de", name:"Các vấn đề", parentId:5 },
  { id:7, slug:"van-hoa", name:"Văn hóa" }, { id:8, slug:"trong-nuoc", name:"Trong nước", parentId:7 },
  { id:9, slug:"unknown-child", name:"Mục mới", parentId:4 },
];
test("news and document lists do not display each other's articles", () => {
  const articles = [{ id:1, categoryIds:[1,2] }, { id:2, categoryIds:[4] }, { id:3, categoryIds:[6] }, { id:4, categoryIds:[8] }];
  const ids = (section) => articles.filter((article) => scope.articleSection(article,categories) === section).map((article) => article.id);
  assert.deepEqual(ids("news"), [1]); assert.deepEqual(ids("documents"), [2]);
  assert.deepEqual(ids("explore"), [3]); assert.deepEqual(ids("culture"), [4]);
});
test("new descendant categories inherit their section from the parent tree", () => {
  assert.equal(scope.articleSection({categoryIds:[9]},categories), "documents");
  assert.deepEqual(scope.categoriesForSection("news",categories).map((category)=>category.id),[1,2]);
});
test("uncategorized and mixed articles are retained for explicit classification", () => {
  assert.equal(scope.articleSection({categoryIds:[]},categories), "unclassified");
  assert.equal(scope.articleSection({categoryIds:[987]},categories), "unclassified");
  assert.equal(scope.articleSection({categoryIds:[2,4]},categories), "mixed");
});
test("create defaults belong to the chosen section", () => {
  for(const section of ["news","documents","explore","culture"]) {
    assert.equal(scope.articleSection({categoryIds:scope.defaultCategoryIds(section,categories)},categories),section);
  }
});
test("malformed category cycles terminate without merging sections arbitrarily", () => {
  const cyclic=[{id:11,slug:"unknown",name:"A",parentId:12},{id:12,slug:"unknown2",name:"B",parentId:11}];
  assert.equal(scope.articleSection({categoryIds:[11]},cyclic),"unclassified");
});
const layoutUrl=await moduleUrl("components/layout/ContentPageLayout.tsx");
const {default: Heading}=await import(await moduleUrl("components/layout/ContentPageHeading.tsx",{"./ContentPageLayout":layoutUrl}));
test("main title appears before the subordinate trail and root pages do not repeat it", () => {
  const html=renderToStaticMarkup(React.createElement(Heading,{title:"QUÂN TRANG",trail:"Tài liệu / Quân trang"}));
  assert.ok(html.indexOf("<h1") < html.indexOf('aria-label="Đường dẫn nội dung"'));
  const root=renderToStaticMarkup(React.createElement(Heading,{title:"TÀI LIỆU"}));
  assert.ok(!root.includes('aria-label="Đường dẫn nội dung"'));
});
const {default: SocialLinks}=await import(await moduleUrl("components/SocialLinks.tsx"));
test("social icons have real official links, accessible names, and safe new-tab links", () => {
  const html=renderToStaticMarkup(React.createElement(SocialLinks));
  for(const name of ["Facebook","YouTube","X"]) assert.ok(html.includes(`aria-label="A509 trên ${name}"`));
  assert.ok(html.includes('href="https://www.facebook.com/A509VN"'));
  assert.ok(html.includes('href="https://www.youtube.com/@A509VN"'));
  assert.ok(html.includes('href="https://x.com/A509VN?s=20"'));
  assert.equal((html.match(/noopener noreferrer/g)||[]).length,3);
});
