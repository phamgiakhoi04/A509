import { useEffect, useState } from "react";
import axiosClient from "@/api/axiosClient";
import { apiError } from "@/utils/apiError";
import RichTextContent from "@/components/editor/RichTextContent";
import RichTextEditor from "@/components/editor/RichTextEditor";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
const types: Record<string, string> = {
  ARTICLE: "Bài viết",
  UNIFORM: "Quân trang / nội dung phục dựng",
  COUNTRY: "Quốc gia",
  UNIFORM_CATEGORY: "Lực lượng / giai đoạn / danh mục",
  CATEGORY: "Chuyên mục bài viết",
  IMAGE: "Chú thích ảnh quân trang",
  ARTICLE_IMAGE: "Chú thích ảnh bài viết",
};
const names: Record<string, string> = {
  title: "Tiêu đề",
  excerpt: "Tóm tắt",
  content: "Nội dung",
  name: "Tên",
  countryName: "Tên quốc gia",
  continent: "Châu lục",
  categoryName: "Tên danh mục",
  description: "Mô tả / chú thích",
  history: "Lịch sử",
  material: "Chất liệu",
};
type Detail = {
  source: Record<string, string | number | null>;
  translations: Record<string, string>;
  fields: string[];
  stale: string[];
};
const longTranslationLimit = 200000;
const isRichTextField = (type: string, field: string) =>
  (type === "ARTICLE" && field === "content") || (type === "UNIFORM" && field === "history");

export default function TranslationManager() {
  const [type, setType] = useState("ARTICLE");
  const [page, setPage] = useState(0);
  const [catalog, setCatalog] = useState<{
    items: Record<string, any>[];
    total: number;
    size: number;
  }>({ items: [], total: 0, size: 25 });
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    setDetail(null);
    setSelected(null);
    axiosClient
      .get(`/api/admin/translations/${type}`, {
        params: { page },
        signal: abort.signal,
      })
      .then((r) => setCatalog(r.data))
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(apiError(e, "Không tải được danh sách."));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [type, page]);
  useEffect(() => {
    if (selected === null) return;
    const abort = new AbortController();
    setLoading(true);
    setError("");
    setMessage("");
    setDetail(null);
    axiosClient
      .get(`/api/admin/translations/${type}/${selected}`, {
        signal: abort.signal,
      })
      .then((r) => {
        setDetail(r.data);
        setDraft(r.data.translations);
      })
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(apiError(e, "Không tải được nội dung."));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [selected, type]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!detail || selected === null) return;
    setError("");
    setMessage("");
    if (detail.fields.some((field) =>
      isRichTextField(type, field) && (draft[field]?.length || 0) > longTranslationLimit,
    )) {
      setError("Nội dung bản dịch và định dạng vượt quá 200.000 ký tự.");
      return;
    }
    setSaving(true);
    try {
      await axiosClient.put(`/api/admin/translations/${type}/${selected}`, {
        fields: Object.fromEntries(
          detail.fields.map((f) => [f, draft[f] || ""]),
        ),
        source: Object.fromEntries(
          detail.fields.map((f) => [f, String(detail.source[f] || "")]),
        ),
      });
      const response = await axiosClient.get(
        `/api/admin/translations/${type}/${selected}`,
      );
      setDetail(response.data);
      setMessage("Đã lưu bản dịch tiếng Anh.");
    } catch (e) {
      setError(apiError(e, "Không lưu được bản dịch."));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="admin-page space-y-6 p-4 sm:p-6 md:p-8">
      <AdminPageHeader
        title="Bản dịch tiếng Anh"
        description={
          <>
            Nhập bản dịch cho toàn bộ nội dung, kể cả lịch sử và chú thích ảnh.
            {" "}Chưa kết nối dịch vụ dịch tự động. Trường chưa dịch hoặc bản dịch có
            nội dung gốc đã thay đổi sẽ dùng tiếng Việt; website không tự tạo bản dịch.
          </>
        }
      />
      <label className="block max-w-lg text-sm font-bold">
        Loại nội dung
        <select
          className="mt-2 block w-full rounded-lg border bg-white p-3 font-normal"
          disabled={saving}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
        >
          {Object.entries(types).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded bg-green-50 p-4 text-green-800">
          {message}
        </p>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[300px_1fr]">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-bold">Danh sách · {catalog.total}</h2>
          <ul className="max-h-[65vh] divide-y overflow-auto">
            {catalog.items.map((item) => (
              <li key={item.id}>
                <button
                  disabled={saving}
                  className={`w-full break-words px-3 py-4 text-left text-sm ${selected === item.id ? "bg-red-50 font-bold text-brand-red" : "hover:bg-gray-50"}`}
                  onClick={() => setSelected(item.id)}
                >
                  #{item.id} ·{" "}
                  {item.title ||
                    item.name ||
                    item.countryName ||
                    item.categoryName ||
                    item.description?.slice(0, 75) ||
                    "Chưa có chú thích"}
                </button>
              </li>
            ))}
          </ul>
          {!catalog.items.length && !loading && (
            <p className="py-6 text-sm text-gray-500">Chưa có nội dung.</p>
          )}
          <div className="mt-4 flex justify-between text-sm">
            <button
              disabled={page === 0 || saving}
              onClick={() => setPage((n) => n - 1)}
              className="disabled:opacity-30"
            >
              ← Trước
            </button>
            <span>{page + 1}</span>
            <button
              disabled={(page + 1) * 25 >= catalog.total || saving}
              onClick={() => setPage((n) => n + 1)}
              className="disabled:opacity-30"
            >
              Sau →
            </button>
          </div>
        </section>
        <section className="min-w-0 rounded-xl border bg-white p-5 md:p-6">
          {loading ? (
            <p role="status">Đang tải...</p>
          ) : !detail ? (
            <p className="py-12 text-center text-gray-500">
              Chọn nội dung để nhập bản dịch.
            </p>
          ) : (
            <form onSubmit={save} className="space-y-6">
              <h2 className="text-xl font-bold">
                Nội dung #{selected} · VI → EN
              </h2>
              {detail.stale.length > 0 && (
                <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">
                  Bản gốc đã thay đổi ở:{" "}
                  {detail.stale.map((f) => names[f] || f).join(", ")}. Hãy kiểm
                  tra và lưu lại bản dịch.
                </p>
              )}
              {detail.fields.map((field) => {
                const label = names[field] || field;
                const source = String(detail.source[field] || "(Trống)");
                const sourceClassName = "max-h-72 overflow-auto rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600";
                const richText = isRichTextField(type, field);
                const update = (value: string) => setDraft((current) => ({ ...current, [field]: value }));
                return (
                  <div key={field} className="grid gap-3 lg:grid-cols-2">
                    <div className="min-w-0">
                      <h3 className="mb-2 text-sm font-bold">{label} · Tiếng Việt</h3>
                      {richText
                        ? <RichTextContent value={source} className={sourceClassName} />
                        : <p className={`${sourceClassName} whitespace-pre-wrap break-words`}>{source}</p>}
                    </div>
                    {richText ? (
                      <RichTextEditor
                        key={`${type}:${selected}:${field}`}
                        label={`${label} · English`}
                        value={draft[field] || ""}
                        onChange={update}
                        disabled={saving}
                      />
                    ) : (
                      <label className="block min-w-0 text-sm font-bold">
                        {label} · English
                        <textarea
                          disabled={saving}
                          className="mt-2 block w-full rounded-lg border p-3 font-normal leading-6"
                          rows={4}
                          maxLength={["title", "name", "countryName", "categoryName"].includes(field) ? 500 : longTranslationLimit}
                          value={draft[field] || ""}
                          onChange={(event) => update(event.target.value)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <p className="text-xs text-gray-500">
                  Để trống trường tiếng Anh để dùng nội dung tiếng Việt.
                </p>
                <button
                  disabled={saving}
                  className="rounded-lg bg-brand-red px-6 py-3 font-bold text-white disabled:opacity-40"
                >
                  {saving ? "Đang lưu..." : "Lưu bản dịch"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
