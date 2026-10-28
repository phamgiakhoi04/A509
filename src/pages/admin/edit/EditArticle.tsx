import { articleSection, categoriesForSection, defaultCategoryIds, sectionLabels, type ContentSection, type ContentCategory } from "@/utils/contentSections";
import { findCaptionReference } from "@/utils/captionReference";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { articleApi } from "@/api/articleApi";
import { adminApi } from "@/api/adminApi";
import SensitiveImage from "@/components/SensitiveImage";
import type { ArticleDTO } from "@/types/models";
import { apiError } from "@/utils/apiError";

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
type ImageItem = { id: number; imageUrl: string | null; description?: string; sensitive?: boolean; referenceUniformId?: number | null; referenceUniformName?: string; referenceAuto?: boolean };
type UniformOption = { id: number; name: string; countryName?: string };
type NewImageItem = { file: File; description: string; sensitive: boolean; referenceUniformId: number | null; referenceAuto?: boolean };

const getErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.status === 403) {
    return "Bạn không có quyền quản lý nội dung này. Hãy đăng nhập bằng tài khoản ADMIN.";
  }
  return apiError(error, fallback);
};

const normalizeDateTime = (value?: string) => value && value.length === 16 ? `${value}:00` : (value || undefined);

export default function EditArticle({ section: fixedSection }: { section?: "documents" } = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDTO | null>(null);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [editorSection, setEditorSection] = useState<ContentSection>(fixedSection || "news");
  const backPath = editorSection === "documents" ? "/admin/tai-lieu" : `/admin/tin-tuc?section=${editorSection}`;
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uniforms, setUniforms] = useState<UniformOption[]>([]);
  const [newImages, setNewImages] = useState<NewImageItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([articleApi.getAllForAdmin(), articleApi.getCategories(), adminApi.getAllUniforms()])
      .then(async ([articlesResult, categoriesResult, uniformsResult]) => {
        if (categoriesResult.status === "fulfilled") {
          setCategories(categoriesResult.value);
        }
        if (articlesResult.status === "rejected") {
          throw articlesResult.reason;
        }
        if (uniformsResult.status === "fulfilled") {
          setUniforms((uniformsResult.value || []).map((uniform: any) => ({ id: Number(uniform.id), name: String(uniform.name || "").trim(), countryName: String(uniform.country?.countryName || "").trim() || undefined })).filter((uniform: UniformOption) => uniform.id && uniform.name));
        }
        const all = articlesResult.value;
        const categoryData = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
        const found = all.find((item) => String(item.id) === id);
        if (!found) throw new Error("Không tìm thấy bài viết.");
        const foundSection = articleSection(found, categoryData);
        if (fixedSection === "documents" && foundSection !== "documents") throw new Error("Bài viết này không thuộc mục Tài liệu.");
        if (foundSection !== "mixed" && foundSection !== "unclassified") setEditorSection(foundSection);
        setArticle(found);
        setCategories(categoryData);
        setImages(await articleApi.getImages(found.id!));
      })
      .catch((e) => setError(e.message || "Không thể tải bài viết."));
  }, [id]);

  const update = (patch: Partial<ArticleDTO>) => setArticle((current) => current ? { ...current, ...patch } : current);
  const toggleCategory = (categoryId: number) => {
    if (!article) return;
    const ids = article.categoryIds || [];
    update({ categoryIds: ids.includes(categoryId) ? ids.filter((value) => value !== categoryId) : [...ids, categoryId] });
  };
  const updateExistingCaption = (imageId: number, description: string) => {
    const match = findCaptionReference(description, uniforms);
    setImages((current) => current.map((image) => image.id === imageId
      ? {
          ...image,
          description,
          ...(match.kind === "match"
            ? { referenceUniformId: match.uniform.id, referenceUniformName: match.uniform.name, referenceAuto: true }
            : image.referenceAuto ? { referenceUniformId: null, referenceUniformName: undefined, referenceAuto: false } : {}),
        }
      : image));
  };
  const updateNewCaption = (index: number, description: string) => {
    const match = findCaptionReference(description, uniforms);
    setNewImages((current) => current.map((image, imageIndex) => imageIndex === index
      ? {
          ...image,
          description,
          ...(match.kind === "match"
            ? { referenceUniformId: match.uniform.id, referenceAuto: true }
            : image.referenceAuto ? { referenceUniformId: null, referenceAuto: false } : {}),
        }
      : image));
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!article) return;
    if (articleSection(article, categories) !== editorSection) { setError("Hãy chọn lại danh mục thuộc đúng nhóm nội dung trước khi lưu."); return; }
    setSaving(true); setError("");
    try {
      const saved = await articleApi.update(article.id!, { ...article, publishedAt: normalizeDateTime(article.publishedAt) });
      setArticle(saved);
      const warnings: string[] = [];
      for (const image of [...newImages]) {
        const uploaded = await articleApi.uploadImage(saved.id!, image.file, image.sensitive, image.description, image.referenceUniformId);
        if (uploaded.referenceWarning) warnings.push(uploaded.referenceWarning);
        setNewImages((current) => current.slice(1));
      }
      if (warnings.length) { setImages(await articleApi.getImages(saved.id!)); setError("Đã lưu. " + warnings.join(" ")); return; }
      navigate(backPath);
    } catch (e: any) {
      setError(getErrorMessage(e, "Không thể lưu bài viết."));
    } finally { setSaving(false); }
  };
  const removeImage = async (imageId: number) => {
    if (!window.confirm("Xóa ảnh này khỏi bài viết?")) return;
    try { await articleApi.deleteImage(imageId); setImages((current) => current.filter((image) => image.id !== imageId)); }
    catch { setError("Không thể xóa ảnh."); }
  };
  const updateImageDescription = async (image: ImageItem) => {
    try { const saved = await articleApi.updateImageDescription(image.id, { description: image.description || "", sensitive: Boolean(image.sensitive), referenceUniformId: image.referenceUniformId || null }); setImages((current) => current.map((item) => item.id === image.id ? saved : item)); setError(saved.referenceWarning || ""); }
    catch (error) { setError(getErrorMessage(error, "Không thể lưu chú thích ảnh.")); }
  };

  if (!article) return <div className="admin-page p-8 text-brand-red">{error || "Đang tải dữ liệu..."}</div>;
  return <div className="admin-page relative mx-auto max-w-5xl bg-white p-8 font-body">
    <button type="button" onClick={() => navigate(backPath)} className="mb-6 flex items-center gap-2 font-medium text-brand-text transition-colors hover:text-brand-red">← Quay lại danh sách</button>
    <h1 className="mb-6 border-b-4 border-brand-red pb-3 font-sans text-3xl font-bold uppercase text-brand-redDark">CHỈNH SỬA BÀI VIẾT</h1>
    {error && <div className="mb-5 border-l-4 border-brand-red bg-red-50 p-3 font-bold text-brand-redDark">{error}</div>}
    <label className="mb-5 block text-sm font-bold">Nhóm nội dung<select aria-label="Nhóm nội dung bài viết" value={editorSection} onChange={(event) => { const section = event.target.value as ContentSection; setEditorSection(section); update({ categoryIds: defaultCategoryIds(section, categories) }); }} className="mt-2 block w-full border border-[#bbb] bg-white p-3">{(fixedSection ? [fixedSection] : ["news", "documents", "explore", "culture", "activities"] as ContentSection[]).map((section) => <option key={section} value={section}>{sectionLabels[section]}</option>)}</select></label>
    {articleSection(article, categories) !== editorSection && <p role="alert" className="mb-4 bg-amber-50 p-3 text-sm text-amber-900">Nội dung chưa thuộc một nhóm duy nhất. <button type="button" className="font-bold underline" onClick={() => update({ categoryIds: defaultCategoryIds(editorSection, categories) })}>Chọn lại danh mục cho nhóm này</button></p>}
    <form onSubmit={save} className="space-y-6 border border-[#ddd] bg-white p-7 shadow-sm">
      <section className="space-y-4"><h2 className="border-b border-[#ddd] pb-2 text-lg font-bold text-brand-redDark">Thông tin bài viết</h2>
        <input required className="input-style w-full" value={article.title} onChange={(e) => update({ title: e.target.value, slug: article.slug || slugify(e.target.value) })} placeholder="Tiêu đề bài viết" />
        <div className="grid gap-4 md:grid-cols-2"><input required className="input-style" value={article.slug} onChange={(e) => update({ slug: slugify(e.target.value) })} placeholder="Slug" /><select className="input-style" value={article.status} onChange={(e) => update({ status: e.target.value as ArticleDTO["status"] })}><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đã xuất bản</option><option value="ARCHIVED">Lưu trữ</option></select><label className="md:col-span-2"><span className="mb-1 block font-bold">Ngày giờ xuất bản <span className="font-normal text-gray-500">(để trống = giữ nguyên)</span></span><input type="datetime-local" className="input-style" value={article.publishedAt ? article.publishedAt.slice(0, 16) : ""} onChange={(e) => update({ publishedAt: e.target.value || undefined })} /></label></div>
        <input className="input-style w-full" value={article.thumbnailUrl || ""} onChange={(e) => update({ thumbnailUrl: e.target.value })} placeholder="URL ảnh đại diện" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(article.thumbnailSensitive)} onChange={(e) => update({ thumbnailSensitive: e.target.checked })} />Yêu cầu đăng nhập để xem ảnh đại diện</label>
        <textarea className="input-style w-full" rows={3} value={article.excerpt || ""} onChange={(e) => update({ excerpt: e.target.value })} placeholder="Tóm tắt bài viết" />
        <textarea required className="input-style w-full" rows={15} value={article.content || ""} onChange={(e) => update({ content: e.target.value })} placeholder="Nội dung bài viết" />
      </section>
      <section><h2 className="mb-3 border-b border-[#ddd] pb-2 text-lg font-bold text-brand-redDark">Danh mục</h2><div className="flex flex-wrap gap-2">{categoriesForSection(editorSection, categories).length ? categoriesForSection(editorSection, categories).map((category) => <button type="button" key={category.id} onClick={() => toggleCategory(category.id)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${article.categoryIds?.includes(category.id) ? "border-brand-red bg-brand-red text-white" : "border-gray-300 text-brand-text hover:border-brand-red hover:text-brand-red"}`}>{category.name}</button>) : <p className="text-sm text-gray-500">Chưa tải được danh mục. Hãy kiểm tra kết nối backend.</p>}</div></section>
      <section>
        <h2 className="mb-3 border-b border-[#ddd] pb-2 text-lg font-bold text-brand-redDark">Ảnh, chú thích và hiện vật tham chiếu</h2>
        <p className="mb-3 text-sm text-gray-600">Chọn hiện vật để ảnh này tự xuất hiện trong mục Reference của trang hiện vật.</p>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {images.map((image) => <div key={image.id} className="border border-[#ddd] p-2">
            <div className="group relative">
              <SensitiveImage src={image.imageUrl || undefined} sensitive={Boolean(image.sensitive)} alt="Ảnh bài viết" className="aspect-[4/3] w-full object-cover" />
              <button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 hidden bg-red-600 px-2 py-1 text-xs text-white group-hover:block">Xóa</button>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(image.sensitive)} onChange={(e) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, sensitive: e.target.checked } : item))} />Yêu cầu đăng nhập để xem ảnh này</label>
            <textarea rows={3} value={image.description || ""} onChange={(e) => updateExistingCaption(image.id, e.target.value)} placeholder="Chú thích; thêm dòng Đồ vật: tên hiện vật để tự gắn Reference" className="mt-2 w-full border border-[#bbb] p-2 text-sm" />
            {(() => { const match = findCaptionReference(image.description || "", uniforms); return match.kind === "match" ? <p className="mt-1 text-xs text-green-700">Đã nhận diện Reference: {match.uniform.name}. Bấm lưu để áp dụng.</p> : match.kind === "ambiguous" ? <p className="mt-1 text-xs text-amber-700">Tên này trùng nhiều hiện vật; vui lòng chọn đúng mục bên dưới.</p> : null; })()}
            <label className="mt-2 block text-xs font-bold text-gray-600">Gắn Reference (có thể chọn thủ công)</label>
            <select value={image.referenceUniformId ?? ""} onChange={(e) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, referenceUniformId: e.target.value ? Number(e.target.value) : null, referenceAuto: false } : item))} className="mt-1 w-full border border-[#bbb] bg-white p-2 text-sm"><option value="">Không gắn hiện vật</option>{uniforms.map((uniform) => <option key={uniform.id} value={uniform.id}>{uniform.countryName ? `${uniform.name} — ${uniform.countryName}` : `${uniform.name} (#${uniform.id})`}</option>)}</select>
            <button type="button" onClick={() => updateImageDescription(image)} className="mt-2 text-sm font-bold text-brand-red hover:underline">Lưu chú thích & Reference</button>
          </div>)}
        </div>
        <p className="mb-3 text-xs leading-5 text-gray-500">Chú thích có chứa chính xác tên một hiện vật sẽ tự gắn Reference (không phân biệt hoa thường/dấu). Nếu tên trùng, hãy chọn hiện vật thủ công.</p>
        <input type="file" accept="image/*" multiple disabled={saving} onChange={(e) => setNewImages(Array.from(e.target.files || []).map((file) => ({ file, description: "", sensitive: false, referenceUniformId: null })))} className="block w-full border border-dashed border-gray-300 p-3 text-sm disabled:opacity-50" />
        {newImages.length > 0 && <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {newImages.map((image, index) => {
            const match = findCaptionReference(image.description, uniforms);
            return <div key={`${image.file.name}-${index}`} className="space-y-2 border border-[#ddd] bg-[#FBF9F5] p-3">
              <div className="flex items-center justify-between gap-3"><p className="min-w-0 truncate text-sm font-bold" title={image.file.name}>{image.file.name}</p><button type="button" disabled={saving} onClick={() => setNewImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className="shrink-0 text-sm font-bold text-red-700 disabled:opacity-50">Bỏ ảnh</button></div>
              <textarea rows={3} value={image.description} disabled={saving} onChange={(e) => updateNewCaption(index, e.target.value)} placeholder="Chú thích; thêm dòng Đồ vật: tên hiện vật" className="w-full border border-[#bbb] bg-white p-2 text-sm disabled:opacity-50" />
              {match.kind === "match" ? <p className="text-xs text-green-700">Sẽ tự gắn Reference: {match.uniform.name}</p> : match.kind === "ambiguous" ? <p className="text-xs text-amber-700">Tên trùng nhiều hiện vật; chọn đúng hiện vật bên dưới.</p> : null}
              <select value={image.referenceUniformId ?? ""} disabled={saving} onChange={(e) => setNewImages((current) => current.map((item, imageIndex) => imageIndex === index ? { ...item, referenceUniformId: e.target.value ? Number(e.target.value) : null, referenceAuto: false } : item))} className="w-full border border-[#bbb] bg-white p-2 text-sm disabled:opacity-50"><option value="">Không gắn Reference</option>{uniforms.map((uniform) => <option key={uniform.id} value={uniform.id}>{uniform.countryName ? `${uniform.name} — ${uniform.countryName}` : `${uniform.name} (#${uniform.id})`}</option>)}</select>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={image.sensitive} disabled={saving} onChange={(e) => setNewImages((current) => current.map((item, imageIndex) => imageIndex === index ? { ...item, sensitive: e.target.checked } : item))} />Yêu cầu đăng nhập để xem ảnh này</label>
            </div>;
          })}
        </div>}
      </section>
      <div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={() => navigate(backPath)} className="rounded-xl px-5 py-3 font-bold hover:bg-gray-100">Hủy</button><button disabled={saving} className="rounded-xl bg-brand-red px-6 py-3 font-bold text-white hover:bg-brand-redDark disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
    </form>
  </div>;
}
