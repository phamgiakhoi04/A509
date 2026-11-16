import createDOMPurify from "dompurify";

// SearchService in a509_be uses the same marker to identify formatted bodies.
const prefix = "<!--a509-rich-text:v1-->";
const purifier = createDOMPurify();

export const fontFamilies = ["Arial", "Georgia", "Times New Roman", "Tahoma", "Verdana", "Courier New"];
export const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
export const textAlignments = ["left", "center", "right", "justify"];

export function normalizeFontFamily(value: string) {
  const firstFont = value.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
  return fontFamilies.find((font) => font.toLowerCase() === firstFont.toLowerCase()) || "";
}

export function normalizeFontSize(value: string) {
  const match = /^(\d+(?:\.\d+)?)(px|pt)$/i.exec(value);
  if (!match) return "";
  const pixels = Number(match[1]) * (match[2].toLowerCase() === "pt" ? 4 / 3 : 1);
  return pixels >= 8 && pixels <= 72 ? `${Math.round(pixels * 10) / 10}px` : "";
}

purifier.addHook("uponSanitizeAttribute", (element, attribute) => {
  if (attribute.attrName === "start") {
    attribute.keepAttr = element.nodeName === "OL" && /^\d{1,6}$/.test(attribute.attrValue);
  }
  if (attribute.attrName !== "style" || !(element instanceof HTMLElement)) return;

  const styles: string[] = [];
  const { fontSize, fontFamily, textAlign } = element.style;
  const size = normalizeFontSize(fontSize);
  const family = normalizeFontFamily(fontFamily);
  if (size) styles.push(`font-size: ${size}`);
  if (family) styles.push(`font-family: ${family}`);
  if (textAlignments.includes(textAlign)) styles.push(`text-align: ${textAlign}`);
  attribute.attrValue = styles.join("; ");
  attribute.keepAttr = styles.length > 0;
});

const allowedTags = ["div", "p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "s", "del", "strike", "ul", "ol", "li", "span"];

export function sanitizeRichText(html: string) {
  if (!purifier.isSupported) return "";
  return purifier.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ["style", "start"],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
  });
}

export function encodeRichText(html: string) {
  return prefix + html;
}

export function decodeRichText(value: string) {
  return value.startsWith(prefix) ? sanitizeRichText(value.slice(prefix.length)) : null;
}

export function editorContent(value: string) {
  const rich = decodeRichText(value);
  if (rich !== null) return rich;
  return value.split(/\r\n?|\n/).map((line) =>
    `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`,
  ).join("");
}

export function richTextPlainText(value = "") {
  const rich = decodeRichText(value);
  if (rich === null) return value;
  const template = document.createElement("template");
  template.innerHTML = rich.replace(/<br\b[^>]*>|<\/(?:p|div|h[23]|li)>/gi, "$& ");
  return template.content.textContent || "";
}
