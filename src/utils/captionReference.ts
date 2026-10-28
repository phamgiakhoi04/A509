const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[đĐ]/g, "d").toLowerCase().trim().replace(/\s+/g, " ");

export function findCaptionReference<T extends { id: number; name: string }>(caption: string, uniforms: T[]) {
  const lines = caption.split(/\r?\n/).filter((line) => /^do vat\s*:/.test(normalize(line)));
  if (!lines.length) return { kind: "none" as const };
  if (lines.length !== 1 || lines[0].includes(",")) return { kind: "ambiguous" as const };
  const name = normalize(lines[0].slice(lines[0].indexOf(":") + 1));
  const matches = uniforms.filter((uniform) => normalize(uniform.name) === name);
  if (!matches.length) return { kind: "missing" as const };
  return matches.length === 1 ? { kind: "match" as const, uniform: matches[0] } : { kind: "ambiguous" as const };
}
