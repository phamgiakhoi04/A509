import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { articleApi } from "@/api/articleApi";
import { adminApi } from "@/api/adminApi";
import type { ArticleDTO } from "@/types/models";

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
type ImageItem = { id: number; imageUrl: string; description?: string; referenceUniformId?: number | null; referenceUniformName?: string };

const getErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.status === 403) {
    return "Phiên đăng nhập không có quyền quản lý tin tức. Hãy đăng xuất, đăng nhập lại và khởi động lại backend sau khi cập nhật.";
  }
  return error?.response?.data?.message || error?.response?.data || error?.message || fallback;
};

const normalizeDateTime = (value?: string) => value && value.length === 16 ? `${value}:00` : (value || undefined);

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDTO | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uniforms, setUniforms] = useState<{ id: number; name: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
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
          setUniforms((uniformsResult.value || []).map((uniform: any) => ({ id: Number(uniform.id), name: String(uniform.name || "").trim() })).filter((uniform: { id: number; name: string }) => uniform.id && uniform.name));
        }
        const all = articlesResult.value;
        const categoryData = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
        const found = all.find((item) => String(item.id) === id);
        if (!found) throw new Error("Không tìm thấy bài viết.");
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
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!article) return;
    setSaving(true); setError("");
    try {
      const saved = await articleApi.update(article.id!, { ...article, publishedAt: normalizeDateTime(article.publishedAt) });
      if (files.length) await Promise.all(files.map((file) => articleApi.uploadImage(saved.id!, file)));
      navigate("/admin/tin-tuc");
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data || "Không thể lưu bài viết.");
    } finally { setSaving(false); }
  };
  const removeImage = async (imageId: number) => {
    if (!window.confirm("Xóa ảnh này khỏi bài viết?")) return;
    try { await articleApi.deleteImage(imageId); setImages((current) => current.filter((image) => image.id !== imageId)); }
    catch { setError("Không thể xóa ảnh."); }
  };
  const updateImageDescription = async (image: ImageItem) => {
    try { const saved = await articleApi.updateImageDescription(image.id, { description: image.description || "", referenceUniformId: image.referenceUniformId || null }); setImages((current) => current.map((item) => item.id === image.id ? saved : item)); }
    catch { setError("Không thể lưu chú thích ảnh."); }
  };

  if (!article) return <div className="admin-page p-8 text-brand-red">{error || "Đang tải dữ liệu..."}</div>;
  return <div className="admin-page relative mx-auto max-w-5xl bg-white p-8 font-body">
    <button type="button" onClick={() => navigate("/admin/tin-tuc")} className="mb-6 flex items-center gap-2 font-medium text-brand-text transition-colors hover:text-brand-red">← Quay lại quản lý tin tức</button>
    <h1 className="mb-6 border-b-4 border-brand-red pb-3 font-sans text-3xl font-bold uppercase text-brand-redDark">CHỈNH SỬA BÀI VIẾT</h1>
    {error && <div className="mb-5 border-l-4 border-brand-red bg-red-50 p-3 font-bold text-brand-redDark">{error}</div>}
    <form onSubmit={save} className="space-y-6 border border-[#ddd] bg-white p-7 shadow-sm">
      <section className="space-y-4"><h2 className="border-b border-[#ddd] pb-2 text-lg font-bold text-brand-redDark">Thông tin bài viết</h2>
        <input required className="input-style w-full" value={article.title} onChange={(e) => update({ title: e.target.value, slug: article.slug || slugify(e.target.value) })} placeholder="Tiêu đề bài viết" />
        <div className="grid gap-4 md:grid-cols-2"><input required className="input-style" value={article.slug} onChange={(e) => update({ slug: slugify(e.target.value) })} placeholder="Slug" /><select className="input-style" value={article.status} onChange={(e) => update({ status: e.target.value as ArticleDTO["status"] })}><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đã xuất bản</option><option value="ARCHIVED">Lưu trữ</option></select><label className="md:col-span-2"><span className="mb-1 block font-bold">Ngày giờ xuất bản <span className="font-normal text-gray-500">(để trống = giữ nguyên)</span></span><input type="datetime-local" className="input-style" value={article.publishedAt ? article.publishedAt.slice(0, 16) : ""} onChange={(e) => update({ publishedAt: e.target.value || undefined })} /></label></div>
        <input className="input-style w-full" value={article.thumbnailUrl || ""} onChange={(e) => update({ thumbnailUrl: e.target.value })} placeholder="URL ảnh đại diện" />
        <textarea className="input-style w-full" rows={3} value={article.excerpt || ""} onChange={(e) => update({ excerpt: e.target.value })} placeholder="Tóm tắt bài viết" />
        <textarea required className="input-style w-full" rows={15} value={article.content || ""} onChange={(e) => update({ content: e.target.value })} placeholder="Nội dung bài viết" />
      </section>
      <section><h2 className="mb-3 border-b border-[#ddd] pb-2 text-lg font-bold text-brand-redDark">Danh mục</h2><div className="flex flex-wrap gap-2">{categories.length ? categories.map((category) => <button type="button" key={category.id} onClick={() => toggleCategory(category.id)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${article.categoryIds?.includes(category.id) ? "border-brand-red bg-brand-red text-white" : "border-gray-300 text-brand-text hover:border-brand-red hover:text-brand-red"}`}>{category.name}</button>) : <p className="text-sm text-gray-500">Chưa tải được danh mục. Hãy kiểm tra kết nối backend.</p>}</div></section>
      <section><h2 className="mb-3 border-b border-[#ddd] pb-2 text-lg font-bold text-brand-redDark">Ảnh, chú thích và hiện vật tham chiếu</h2><p className="mb-3 text-sm text-gray-600">Chọn hiện vật để ảnh này tự xuất hiện trong mục Reference của trang hiện vật.</p><div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">{images.map((image) => <div key={image.id} className="border border-[#ddd] p-2"><div className="group relative"><img src={image.imageUrl} alt="Ảnh bài viết" className="aspect-[4/3] w-full object-cover" /><button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 hidden bg-red-600 px-2 py-1 text-xs text-white group-hover:block">Xóa</button></div><input value={image.description || ""} onChange={(e) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, description: e.target.value } : item))} placeholder="Chú thích ảnh" className="mt-2 w-full border border-[#bbb] p-2 text-sm" /><select value={image.referenceUniformId ?? ""} onChange={(e) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, referenceUniformId: e.target.value ? Number(e.target.value) : null } : item))} className="mt-2 w-full border border-[#bbb] bg-white p-2 text-sm"><option value="">Không gắn hiện vật</option>{uniforms.map((uniform) => <option key={uniform.id} value={uniform.id}>{uniform.name}</option>)}</select><button type="button" onClick={() => updateImageDescription(image)} className="mt-2 text-sm font-bold text-brand-red hover:underline">Lưu chú thích & Reference</button></div>)}</div><input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="block w-full border border-dashed border-gray-300 p-3 text-sm" />{files.length > 0 && <p className="mt-2 text-sm text-gray-500">Đã chọn {files.length} ảnh mới.</p>}</section>
      <div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={() => navigate("/admin/tin-tuc")} className="rounded-xl px-5 py-3 font-bold hover:bg-gray-100">Hủy</button><button disabled={saving} className="rounded-xl bg-brand-red px-6 py-3 font-bold text-white hover:bg-brand-redDark disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
    </form>
  </div>;
}
