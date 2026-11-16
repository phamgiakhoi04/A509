import { decodeRichText } from "@/utils/richText";

type Props = {
  value?: string | null;
  className?: string;
  legacyWhitespace?: "whitespace-pre-wrap" | "whitespace-pre-line";
};

export default function RichTextContent({
  value = "",
  className = "",
  legacyWhitespace = "whitespace-pre-wrap",
}: Props) {
  const html = decodeRichText(value || "");
  if (html === null) {
    return <div className={`${legacyWhitespace} break-words ${className}`}>{value}</div>;
  }

  return <div className={`article-rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
