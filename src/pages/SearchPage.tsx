import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "@/api/axiosClient";
import { useLanguage } from "@/contexts/LanguageContext";
import ContentPageLayout, {
  ContentPageTitle,
} from "@/components/layout/ContentPageLayout";
import SearchForm from "@/components/SearchForm";
type Result = {
  key: string;
  type: string;
  title: string;
  description: string;
  href: string;
};
const labels: Record<string, [string, string]> = {
  all: ["Tất cả", "All"],
  article: ["Bài viết", "Articles"],
  uniform: ["Quân trang", "Uniforms"],
  reenactment: ["Phục dựng", "Reenactment"],
  country: ["Quốc gia", "Countries"],
  force: ["Lực lượng", "Forces"],
  period: ["Giai đoạn", "Periods"],
};
export default function SearchPage() {
  const { language } = useLanguage();
  const en = language === "en";
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const type = params.get("type") || "all";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const [data, setData] = useState<{
    items: Result[];
    total: number;
    size: number;
  }>({ items: [], total: 0, size: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!query) {
      setData({ items: [], total: 0, size: 20 });
      setLoading(false);
      return;
    }
    const abort = new AbortController();
    setLoading(true);
    setError(false);
    axiosClient
      .get("/api/search", {
        params: { q: query, type, page },
        signal: abort.signal,
      })
      .then((r) => setData(r.data))
      .catch(() => {
        if (!abort.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [query, type, page, language, retry]);
  function change(next: Record<string, string>) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) =>
      value ? p.set(key, value) : p.delete(key),
    );
    setParams(p);
  }
  return (
    <ContentPageLayout className="min-h-[55vh]">
      <section className="min-w-0">
        <ContentPageTitle>{en ? "Search" : "Tra cứu"}</ContentPageTitle>
        <p className="mb-5 text-sm text-gray-600">
          {en
            ? "Search articles, uniforms, countries, forces and reenactment periods."
            : "Tìm bài viết, quân trang, quốc gia, lực lượng và giai đoạn phục dựng."}
        </p>
        <SearchForm key={`${query}-${type}`} initialQuery={query} type={type} />
        <label className="mt-4 flex items-center gap-3 text-sm">
          {en ? "Content type" : "Loại nội dung"}
          <select
            value={type}
            className="rounded border bg-white p-2"
            onChange={(e) => change({ type: e.target.value, page: "" })}
          >
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label[en ? 1 : 0]}
              </option>
            ))}
          </select>
        </label>
        {!query ? (
          <p className="py-16 text-center text-gray-500">
            {en
              ? "Enter a keyword to search."
              : "Nhập từ khóa để bắt đầu tra cứu."}
          </p>
        ) : loading ? (
          <p role="status" className="py-16 text-center">
            {en ? "Searching..." : "Đang tra cứu..."}
          </p>
        ) : error ? (
          <p role="alert" className="py-12 text-red-700">
            {en
              ? "Could not load search results."
              : "Không tải được kết quả tra cứu."}
            <button
              className="ml-3 underline"
              onClick={() => setRetry((n) => n + 1)}
            >
              {en ? "Retry" : "Thử lại"}
            </button>
          </p>
        ) : (
          <>
            <p className="my-5 text-sm text-gray-500">
              {en
                ? `${data.total} results for “${query}”`
                : `${data.total} kết quả cho “${query}”`}
            </p>
            <div className="divide-y border-y">
              {data.items.map((result) => (
                <Link
                  key={result.key}
                  to={result.href}
                  className="block py-5 hover:text-brand-red"
                >
                  <span className="text-xs font-bold uppercase text-brand-red">
                    {labels[result.type]?.[en ? 1 : 0] || result.type}
                  </span>
                  <h2 className="mt-1 font-display text-xl font-bold">
                    {result.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                    {result.description}
                  </p>
                </Link>
              ))}
            </div>
            {data.total > data.size && (
              <nav
                aria-label={en ? "Search pages" : "Trang kết quả"}
                className="mt-6 flex items-center justify-between gap-3 text-sm"
              >
                <button
                  disabled={page === 0}
                  className="rounded border px-4 py-2 disabled:opacity-30"
                  onClick={() => change({ page: String(page - 1) })}
                >
                  ← {en ? "Previous" : "Trước"}
                </button>
                <span>
                  {page + 1} / {Math.ceil(data.total / data.size)}
                </span>
                <button
                  disabled={(page + 1) * data.size >= data.total}
                  className="rounded border px-4 py-2 disabled:opacity-30"
                  onClick={() => change({ page: String(page + 1) })}
                >
                  {en ? "Next" : "Sau"} →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </ContentPageLayout>
  );
}
