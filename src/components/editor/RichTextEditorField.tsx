import { useEffect, useRef, useState, type MouseEvent } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered,
  Redo2, RemoveFormatting, Strikethrough, Underline, Undo2,
} from "lucide-react";
import {
  editorContent, encodeRichText, fontFamilies, fontSizes, normalizeFontFamily,
  normalizeFontSize, sanitizeRichText, textAlignments,
} from "@/utils/richText";

export type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
};

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
  }),
  TextStyle,
  FontFamily,
  FontSize,
  TextAlign.configure({ types: ["heading", "paragraph"], alignments: textAlignments }),
];

const alignmentControls = [
  { value: "left", label: "Căn trái", Icon: AlignLeft },
  { value: "center", label: "Căn giữa", Icon: AlignCenter },
  { value: "right", label: "Căn phải", Icon: AlignRight },
  { value: "justify", label: "Căn đều hai bên", Icon: AlignJustify },
];

function preserveSelection(event: MouseEvent) {
  event.preventDefault();
}

function FormattingControls({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      const { fontFamily, fontSize } = current.getAttributes("textStyle");
      return {
        fontFamily: normalizeFontFamily(fontFamily || ""),
        fontSize: normalizeFontSize(fontSize || ""),
        heading: current.isActive("heading", { level: 2 }) ? "2" : current.isActive("heading", { level: 3 }) ? "3" : "",
        alignment: textAlignments.find((value) => current.isActive({ textAlign: value })) || "left",
        bold: current.isActive("bold"),
        italic: current.isActive("italic"),
        underline: current.isActive("underline"),
        strike: current.isActive("strike"),
        bulletList: current.isActive("bulletList"),
        orderedList: current.isActive("orderedList"),
        undo: current.can().undo(),
        redo: current.can().redo(),
      };
    },
  });

  const groups = [
    [
      { label: "In đậm", Icon: Bold, pressed: state.bold, run: () => editor.chain().focus().toggleBold().run() },
      { label: "In nghiêng", Icon: Italic, pressed: state.italic, run: () => editor.chain().focus().toggleItalic().run() },
      { label: "Gạch chân", Icon: Underline, pressed: state.underline, run: () => editor.chain().focus().toggleUnderline().run() },
      { label: "Gạch ngang", Icon: Strikethrough, pressed: state.strike, run: () => editor.chain().focus().toggleStrike().run() },
    ],
    alignmentControls.map(({ value, label, Icon }) => ({
      label, Icon, pressed: state.alignment === value,
      run: () => editor.chain().focus().setTextAlign(value).run(),
    })),
    [
      { label: "Danh sách dấu đầu dòng", Icon: List, pressed: state.bulletList, run: () => editor.chain().focus().toggleBulletList().run() },
      { label: "Danh sách đánh số", Icon: ListOrdered, pressed: state.orderedList, run: () => editor.chain().focus().toggleOrderedList().run() },
    ],
    [
      { label: "Hoàn tác", Icon: Undo2, unavailable: !state.undo, run: () => editor.chain().focus().undo().run() },
      { label: "Làm lại", Icon: Redo2, unavailable: !state.redo, run: () => editor.chain().focus().redo().run() },
      { label: "Xóa định dạng", Icon: RemoveFormatting, run: () => editor.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().run() },
    ],
  ];

  const sizeOptions = new Set<string>(fontSizes.map((size) => `${size}px`));
  if (state.fontSize) sizeOptions.add(state.fontSize);

  return (
    <div role="group" aria-label="Định dạng văn bản" className="flex flex-wrap items-center gap-1.5 border-b border-gray-300 bg-gray-50 p-2">
      <select
        aria-label="Kiểu đoạn văn"
        className="article-editor-select"
        disabled={disabled}
        value={state.heading}
        onChange={({ target: { value } }) => {
          const chain = editor.chain().focus();
          if (value) chain.setHeading({ level: value === "2" ? 2 : 3 }).run();
          else chain.setParagraph().run();
        }}
      >
        <option value="">Đoạn văn</option>
        <option value="2">Tiêu đề mục</option>
        <option value="3">Tiêu đề phụ</option>
      </select>
      <select
        aria-label="Phông chữ"
        className="article-editor-select"
        disabled={disabled}
        value={state.fontFamily}
        onChange={({ target: { value } }) => {
          const chain = editor.chain().focus();
          if (value) chain.setFontFamily(value).run();
          else chain.unsetFontFamily().run();
        }}
      >
        <option value="">Phông mặc định</option>
        {fontFamilies.map((font) => <option key={font} value={font}>{font}</option>)}
      </select>
      <select
        aria-label="Cỡ chữ"
        className="article-editor-select"
        disabled={disabled}
        value={state.fontSize}
        onChange={({ target: { value } }) => {
          const chain = editor.chain().focus();
          if (value) chain.setFontSize(value).run();
          else chain.unsetFontSize().run();
        }}
      >
        <option value="">Cỡ mặc định</option>
        {[...sizeOptions].map((size) => <option key={size} value={size}>{size}</option>)}
      </select>
      {groups.map((group) => (
        <div key={group[0].label} className="flex items-center gap-0.5 border-l border-gray-300 pl-1.5">
          {group.map(({ label, Icon, run, ...button }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-pressed={"pressed" in button ? button.pressed : undefined}
              title={label}
              disabled={disabled || ("unavailable" in button && button.unavailable)}
              onMouseDown={preserveSelection}
              onClick={run}
              className="article-editor-button"
            >
              <Icon aria-hidden="true" size={17} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function RichTextEditorField({ label, value, onChange, disabled = false, required = false }: RichTextEditorProps) {
  const currentValue = useRef(value);
  const [initialContent] = useState(() => editorContent(value));
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled,
    parseOptions: { preserveWhitespace: "full" },
    editorProps: {
      attributes: {
        class: "article-rich-text min-h-48 px-3 py-3 text-base leading-relaxed outline-none",
        role: "textbox",
        "aria-label": label,
        "aria-multiline": "true",
        "aria-required": String(required),
      },
      transformPastedHTML: sanitizeRichText,
    },
    onUpdate: ({ editor: current }) => {
      const next = current.getText().trim() ? encodeRichText(current.getHTML()) : "";
      currentValue.current = next;
      onChange(next);
    },
  });

  useEffect(() => {
    if (!editor || currentValue.current === value) return;
    currentValue.current = value;
    editor.commands.setContent(editorContent(value), {
      emitUpdate: false,
      parseOptions: { preserveWhitespace: "full" },
    });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);

  return (
    <div className="min-w-0">
      <div className="mb-2 text-sm font-bold">{label}{required && " *"}</div>
      <div className="rounded-lg border border-gray-300 bg-white focus-within:border-brand-red">
        {editor && <FormattingControls editor={editor} disabled={disabled} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
