import { lazy, Suspense } from "react";
import type { RichTextEditorProps } from "./RichTextEditorField";

const RichTextEditorField = lazy(() => import("./RichTextEditorField"));

export default function RichTextEditor(props: RichTextEditorProps) {
  return (
    <Suspense fallback={<p role="status" className="p-3 text-sm text-gray-600">Đang tải trình soạn thảo…</p>}>
      <RichTextEditorField {...props} />
    </Suspense>
  );
}
