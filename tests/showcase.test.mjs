import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function sourceModule(name) {
  const code = await readFile(new URL(`../src/utils/${name}.ts`, import.meta.url), "utf8");
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}
const { galleryRows } = await sourceModule("galleryRows");
const { findCaptionReference } = await sourceModule("captionReference");
test("mixed layouts preserve every image and full images occupy their own row", () => {
  for (let mask = 0; mask < 256; mask++) {
    const images = Array.from({ length: 8 }, (_, id) => ({ id, displayMode: mask & (1 << id) ? "FULL" : "GRID" }));
    const rows = galleryRows(images);
    assert.deepEqual(rows.flat(), images);
    for (const row of rows) {
      assert.ok(row.length >= 1 && row.length <= 3);
      if (row.some((image) => image.displayMode === "FULL")) assert.equal(row.length, 1);
    }
  }
});
test("automatic row remainders remain wide instead of leaving empty grid cells", () => {
  for (const [count, expected] of [[0, []], [1, [1]], [2, [2]], [3, [3]], [4, [3,1]], [5,[3,2]], [7,[3,3,1]]]) {
    assert.deepEqual(galleryRows(Array.from({ length: count }, () => ({}))).map((row) => row.length), expected);
  }
});
const uniforms = [{ id: 1, name: "Mũ cối" }, { id: 2, name: "Áo dài" }];
test("caption line matches exactly without accents or case sensitivity", () => {
  assert.equal(findCaptionReference("Ảnh năm 1968\nDO VAT:  MU COI", uniforms).uniform.id, 1);
  assert.equal(findCaptionReference("Đồ vật: áo dài", uniforms).uniform.id, 2);
});
test("mentions elsewhere do not accidentally attach a reference", () => {
  assert.equal(findCaptionReference("Người lính đội mũ cối", uniforms).kind, "none");
  assert.equal(findCaptionReference("Đồ vật: mũ cối lớn", uniforms).kind, "missing");
});
test("missing, duplicate or multiple names are not linked arbitrarily", () => {
  assert.equal(findCaptionReference("Đồ vật: không có", uniforms).kind, "missing");
  assert.equal(findCaptionReference("Đồ vật: mũ cối", [...uniforms, { id:3, name:"mu coi" }]).kind, "ambiguous");
  assert.equal(findCaptionReference("Đồ vật: mũ cối, áo dài", uniforms).kind, "ambiguous");
});
