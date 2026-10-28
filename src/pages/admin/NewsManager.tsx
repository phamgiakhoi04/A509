import {
  articleSection,
  categoriesForSection,
  defaultCategoryIds,
  sectionLabels,
  type ClassifiedSection,
  type ContentSection,
  type ContentCategory,
} from "@/utils/contentSections";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { articleApi } from "@/api/articleApi";
import type { ArticleDTO } from "@/types/models";
import { apiError } from "@/utils/apiError";

type Category = ContentCategory;

const getErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.status === 403) {
    return "Bạn không có quyền quản lý nội dung này. Hãy đăng nhập bằng tài khoản ADMIN.";
  }
  return apiError(error, fallback);
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  thumbnailUrl: "",
  thumbnailSensitive: false,
  publishedAt: "",
  status: "DRAFT" as ArticleDTO["status"],
  featured: false,
  featuredOrder: 0,
  categoryIds: [] as number[],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeDateTime = (value: string) =>
  value && value.length === 16 ? `${value}:00` : value || undefined;

export default function NewsManager({
  title = "Quản lý tin tức",
  itemLabel = "bài viết",
  scope = "news",
}: { title?: string; itemLabel?: string; scope?: "news" | "documents" } = {}) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selected = params.get("section") || "news";
  const activeSection: ClassifiedSection =
    scope === "documents"
      ? "documents"
      : [
            "news",
            "explore",
            "culture",
            "activities",
            "unclassified",
            "mixed",
          ].includes(selected)
        ? (selected as ClassifiedSection)
        : "news";
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageFilesSensitive, setImageFilesSensitive] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [articlesResult, categoriesResult] = await Promise.allSettled([
        articleApi.getAllForAdmin(),
        articleApi.getCategories(),
      ]);
      if (articlesResult.status === "fulfilled") {
        setArticles(articlesResult.value || []);
      } else {
        setArticles([]);
        setError(
          getErrorMessage(
            articlesResult.reason,
            "Không thể tải danh sách bài viết.",
          ),
        );
      }
      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value);
      } else {
        setCategories([]);
        setError(
          getErrorMessage(categoriesResult.reason, "Không thể tải danh mục."),
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách bài viết.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleArticles = articles.filter(
    (article) => articleSection(article, categories) === activeSection,
  );
  const visibleCategories =
    activeSection === "mixed" || activeSection === "unclassified"
      ? []
      : categoriesForSection(activeSection, categories);

  const openCreate = () => {
    if (activeSection === "mixed" || activeSection === "unclassified") return;
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryIds: defaultCategoryIds(activeSection, categories),
    });
    setImageFiles([]);
    setImageFilesSensitive(false);
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const openEdit = (article: ArticleDTO) => {
    if (article.id) {
      navigate(
        scope === "documents"
          ? `/admin/tai-lieu/edit/${article.id}`
          : `/admin/tin-tuc/edit/${article.id}?section=${activeSection}`,
      );
      return;
    }
    setEditingId(article.id ?? null);
    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content || "",
      thumbnailUrl: article.thumbnailUrl || "",
      thumbnailSensitive: Boolean(article.thumbnailSensitive),
      publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : "",
      status: article.status,
      featured: article.featured,
      featuredOrder: article.featuredOrder || 0,
      categoryIds: article.categoryIds || [],
    });
    setImageFiles([]);
    setShowForm(true);
    setError("");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError("Tiêu đề, slug và nội dung là bắt buộc.");
      return;
    }

    setSaving(true);
    setError("");
    const payload: ArticleDTO = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      thumbnailUrl: form.thumbnailUrl.trim() || undefined,
      publishedAt: normalizeDateTime(form.publishedAt),
    };
    if (articleSection(payload, categories) !== activeSection) {
      setSaving(false);
      setError("Hãy chọn danh mục thuộc đúng nhóm nội dung đang quản lý.");
      return;
    }
    try {
      const saved = editingId
        ? await articleApi.update(editingId, payload)
        : await articleApi.create(payload);
      if (payload.status === "PUBLISHED") {
        setNotice(
          saved.englishTranslationAvailable
            ? "Bài viết đã lưu kèm bản dịch tiếng Anh."
            : "Bài viết đã lưu, nhưng chưa có bản dịch tiếng Anh. Hãy cấu hình DEEPL_API_KEY trong backend rồi lưu hoặc xuất bản lại bài viết.",
        );
      } else {
        setNotice("");
      }
      if (saved.id && imageFiles.length) {
        await Promise.all(
          imageFiles.map((file) =>
            articleApi.uploadImage(saved.id!, file, imageFilesSensitive),
          ),
        );
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(getErrorMessage(err, "Không thể lưu bài viết."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (article: ArticleDTO) => {
    if (!article.id || !window.confirm(`Xóa bài viết “${article.title}”?`))
      return;
    try {
      await articleApi.delete(article.id);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể xóa bài viết.");
    }
  };

  const toggleCategory = (id: number) => {
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(id)
        ? current.categoryIds.filter((categoryId) => categoryId !== id)
        : [...current.categoryIds, id],
    }));
  };

  return (
    <div className="admin-page relative space-y-6 p-8 font-body">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black uppercase text-brand-redDark">
          {title}
        </h1>
        <button
          onClick={openCreate}
          disabled={
            activeSection === "mixed" || activeSection === "unclassified"
          }
          className="flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white shadow-pop hover:bg-brand-redDark"
        >
          <Plus size={20} /> Thêm {itemLabel}
        </button>
      </div>

      {scope === "news" && (
        <label className="block max-w-sm text-sm font-bold">
          Nhóm nội dung
          <select
            aria-label="Nhóm nội dung"
            value={activeSection}
            onChange={(event) => setParams({ section: event.target.value })}
            className="mt-2 block w-full border border-[#bbb] bg-white p-3"
          >
            {(
              [
                "news",
                "explore",
                "culture",
                "activities",
                "unclassified",
                "mixed",
              ] as ClassifiedSection[]
            ).map((section) => (
              <option key={section} value={section}>
                {sectionLabels[section]}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="text-sm text-gray-500">
        Đang hiển thị: {sectionLabels[activeSection]}. {visibleArticles.length}{" "}
        nội dung.
      </p>
      {error && (
        <div className="rounded-xl border-l-4 border-brand-red bg-red-50 p-4 font-bold text-brand-redDark">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-brand-red/10 bg-white shadow-pop">
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="animate-spin text-brand-red" size={36} />
          </div>
        ) : visibleArticles.length === 0 ? (
          <p className="p-16 text-center text-gray-500">
            Chưa có {itemLabel} trong nhóm {sectionLabels[activeSection]}.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between gap-4 p-5 hover:bg-brand-bg/40"
              >
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-brand-text">
                    {article.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    /{article.slug} · {article.status}{" "}
                    {article.featured ? "· Tin nổi bật" : ""}{" "}
                    {article.status === "PUBLISHED"
                      ? article.englishTranslationAvailable
                        ? "· Có bản dịch EN"
                        : "· Chưa có bản dịch EN"
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEdit(article)}
                    aria-label="Sửa"
                    className="rounded-lg p-2 text-brand-yellow hover:bg-brand-yellow/20"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => remove(article)}
                    aria-label="Xóa"
                    className="rounded-lg p-2 text-brand-red hover:bg-brand-red/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={save}
            className="admin-article-form max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#ddd] bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-black uppercase text-brand-redDark">
                {editingId ? `Sửa ${itemLabel}` : `Thêm ${itemLabel}`}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Đóng"
                className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="input-style md:col-span-2"
                placeholder="Tiêu đề *"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: form.slug || slugify(e.target.value),
                  })
                }
              />
              <input
                className="input-style"
                placeholder="Slug *"
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: slugify(e.target.value) })
                }
              />
              <select
                className="input-style"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as ArticleDTO["status"],
                  })
                }
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
              <p className="md:col-span-2 -mt-2 text-xs text-gray-500">
                Sau khi lưu, vào mục “Bản dịch tiếng Anh” để nhập tiêu đề, tóm
                tắt, nội dung và chú thích ảnh. Chưa bật dịch tự động.
              </p>
              <label className="md:col-span-2">
                <span className="mb-1 block font-bold">
                  Ngày giờ xuất bản{" "}
                  <span className="font-normal text-gray-500">
                    (để trống = thời điểm lưu)
                  </span>
                </span>
                <input
                  type="datetime-local"
                  className="input-style"
                  value={form.publishedAt}
                  onChange={(e) =>
                    setForm({ ...form, publishedAt: e.target.value })
                  }
                />
              </label>
              <input
                className="input-style md:col-span-2"
                placeholder="URL ảnh đại diện (không bắt buộc)"
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm({ ...form, thumbnailUrl: e.target.value })
                }
              />
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.thumbnailSensitive}
                  onChange={(e) =>
                    setForm({ ...form, thumbnailSensitive: e.target.checked })
                  }
                />
                Yêu cầu đăng nhập để xem ảnh đại diện
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block font-bold">
                  Ảnh trong bài viết{" "}
                  <span className="font-normal text-gray-500">
                    (không bắt buộc)
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setImageFiles(Array.from(e.target.files || []))
                  }
                  className="block w-full border border-dashed border-gray-300 p-3 text-sm"
                />
                <span className="mt-1 block text-xs text-gray-500">
                  Có thể lưu bài chỉ với tiêu đề, slug và nội dung. Nếu chọn
                  ảnh, ảnh sẽ được tải lên sau khi lưu bài.
                </span>
              </label>
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={imageFilesSensitive}
                  onChange={(e) => setImageFilesSensitive(e.target.checked)}
                />
                Yêu cầu đăng nhập để xem các ảnh vừa tải lên
              </label>
              <textarea
                className="input-style md:col-span-2"
                rows={3}
                placeholder="Tóm tắt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
              <textarea
                className="input-style md:col-span-2"
                rows={12}
                placeholder="Nội dung *"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />{" "}
                Tin nổi bật
              </label>
              <label className="flex items-center gap-2">
                Thứ tự{" "}
                <input
                  type="number"
                  min={0}
                  className="w-20 border p-2"
                  value={form.featuredOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featuredOrder: Number(e.target.value) || 0,
                    })
                  }
                />
              </label>
            </div>
            <div className="mt-4">
              <p className="mb-2 font-bold">Danh mục</p>
              <div className="flex flex-wrap gap-2">
                {visibleCategories.length ? (
                  visibleCategories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`rounded-full border px-3 py-1 text-sm ${form.categoryIds.includes(category.id) ? "border-brand-red bg-brand-red text-white" : "border-gray-300 text-brand-text"}`}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa tải được danh mục. Hãy kiểm tra kết nối backend.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3 border-t pt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl px-5 py-3 font-bold hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 font-bold text-white hover:bg-brand-redDark disabled:opacity-50"
              >
                {saving && <Loader2 className="animate-spin" size={18} />} Lưu
                bài viết
              </button>
            </div>
          </form>
          <style>{`
            .admin-article-form .input-style {
              width: 100%; border: 1px solid #bbb; background: #fff;
              padding: 12px 14px; color: #333; outline: none;
              border-radius: 0;
            }
            .admin-article-form .input-style:focus {
              border-color: #b51f24; box-shadow: 0 0 0 2px rgba(181,31,36,.12);
            }
            .admin-article-form textarea.input-style { resize: vertical; }
          `}</style>
        </div>
      )}
    </div>
  );
}
