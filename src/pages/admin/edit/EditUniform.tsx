import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import Button from "@/components/ui/Button";
import { UploadCloud, X, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Uniform, CountryOption } from "@/types/models";

type EditUniformProps = {
  categoryType?: "UNIFORM" | "REENACTMENT";
  redirectPath?: string;
};
const slugifyPeriod = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function EditUniform({
  categoryType = "UNIFORM",
  redirectPath = "/admin/quan-trang",
}: EditUniformProps = {}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uniform, setUniform] = useState<Uniform | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    history: "",
    countryId: 0,
    categoryId: "",
    period: "",
  });

  const [existingImages, setExistingImages] = useState<{ id: number; imageUrl: string; description?: string; sensitive?: boolean }[]>([]);
  const [savingImageId, setSavingImageId] = useState<number | null>(null);
  const [newSelectedImages, setNewSelectedImages] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [newImageDescriptions, setNewImageDescriptions] = useState<string[]>([]);
  const [newImageSensitive, setNewImageSensitive] = useState<boolean[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const visibleCategories = categoryType === "REENACTMENT"
    ? categories.filter((category) => Number(category.countryId) === Number(formData.countryId))
    : categories;
  const selectedForce = visibleCategories.find((category) => String(category.id) === String(formData.categoryId));
  const visiblePeriods = categoryType === "REENACTMENT" ? (selectedForce?.children || []) : [];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [uniformData, countriesData, categoriesData] = await Promise.all([
          adminApi.getUniformById(Number(id)),
          adminApi.getAllCountries(),
          categoryType === "REENACTMENT" ? adminApi.getRootCategoriesByType("REENACTMENT") : adminApi.getCategoriesByType(categoryType),
        ]);

        setUniform(uniformData);
        setCountries(countriesData || []);
        const usableCategories = categoryType === "REENACTMENT"
          ? ((categoriesData || []).find((category: any) => category.categoryName === "Phục dựng trang phục") || (categoriesData || [])[0])?.children || []
          : (categoriesData || []);
        setCategories(usableCategories);

        setFormData({
          name: uniformData.name || "",
          description: uniformData.description || "",
          history: uniformData.history || "",
          countryId: uniformData.country?.id || uniformData.countryId || Number(countriesData?.[0]?.id) || 0,
          categoryId: uniformData.category?.id || uniformData.categoryId || "",
          period: uniformData.period || "",
        });

        setExistingImages(uniformData.images?.map((img: any) => ({ id: img.id, imageUrl: img.imageUrl, description: img.description || "", sensitive: Boolean(img.sensitive) })) || []);
      } catch (error: any) {
        console.error("Lỗi tải dữ liệu:", error);
        alert(error.response?.data?.message || "Không thể tải thông tin quân trang");
        navigate(redirectPath);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [id, navigate, categoryType, redirectPath]);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        navigate(redirectPath);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      alert("Mỗi ảnh tối đa 5MB");
      return;
    }

    const totalAfter = newSelectedImages.length + files.length + existingImages.length;
    if (totalAfter > 5) {
      alert(`Tổng số ảnh không được vượt quá 5 (hiện có ${existingImages.length})`);
      return;
    }

    setNewSelectedImages((prev) => [...prev, ...files]);
    setNewPreviewUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    setNewImageDescriptions((prev) => [...prev, ...files.map(() => "")]);
    setNewImageSensitive((prev) => [...prev, ...files.map(() => false)]);
  };

  const removeNewPreview = (index: number) => {
    setNewSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setNewImageDescriptions((prev) => prev.filter((_, i) => i !== index));
    setNewImageSensitive((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (image: { id: number; imageUrl: string; description?: string }) => {
    if (!window.confirm("Xóa ảnh này khỏi quân trang?")) return;
    try {
      await adminApi.deleteImage(image.id);
      setExistingImages((current) => current.filter((item) => item.id !== image.id));
    } catch (error: any) {
      alert(error.response?.data || "Không thể xóa ảnh.");
    }
  };

  const saveExistingDescription = async (image: { id: number; description?: string; sensitive?: boolean }) => {
    setSavingImageId(image.id);
    try {
      const updated = await adminApi.updateImageDescription(image.id, { description: image.description || "", sensitive: Boolean(image.sensitive) });
      setExistingImages((current) => current.map((item) => item.id === image.id
        ? { ...item, description: updated.description || "", sensitive: Boolean(updated.sensitive) }
        : item));
    } catch (error: any) {
      alert(error.response?.data || "Không thể lưu chú thích ảnh.");
    } finally {
      setSavingImageId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.name.trim()) {
      alert(categoryType === "REENACTMENT" ? "Tiêu đề nội dung không được để trống" : "Tên hiện vật không được để trống");
      return;
    }
    if (!formData.countryId) {
      alert("Vui lòng chọn quốc gia");
      return;
    }
    if (!formData.categoryId) {
      alert(categoryType === "REENACTMENT" ? "Vui lòng chọn lực lượng" : "Vui lòng chọn danh mục");
      return;
    }
    if (categoryType === "REENACTMENT" && !visibleCategories.some((category) => String(category.id) === String(formData.categoryId))) {
      alert("Lực lượng không thuộc quốc gia đang chọn");
      return;
    }
    if (categoryType === "REENACTMENT" && !formData.period) {
      alert("Vui lòng chọn giai đoạn lịch sử");
      return;
    }
    if (categoryType === "REENACTMENT" && existingImages.length + newSelectedImages.length === 0) {
      alert("Nội dung phục dựng cần có ít nhất một ảnh");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("history", formData.history || "");
      formDataToSend.append("countryId", formData.countryId.toString());
      if (formData.categoryId) formDataToSend.append("categoryId", String(formData.categoryId));
      if (categoryType === "REENACTMENT") formDataToSend.append("period", formData.period);

      newSelectedImages.forEach((file) => {
        formDataToSend.append("imageFiles", file);
      });
      newImageDescriptions.forEach((description) => {
        formDataToSend.append("imageDescriptions", description);
      });
      newImageSensitive.forEach((sensitive) => {
        formDataToSend.append("imageSensitive", String(sensitive));
      });

      await adminApi.updateUniform(Number(id), formDataToSend);

      setShowSuccessToast(true);
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật quân trang");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-red" size={48} />
      </div>
    );
  }

  if (!uniform) return null;

  return (
    <div className="admin-page mx-auto max-w-5xl bg-white p-8 font-body relative">
      <button
        onClick={() => navigate(redirectPath)}
        className="mb-8 flex items-center gap-2 text-brand-text hover:text-brand-red transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Quay lại danh sách
      </button>

      <h1 className="mb-6 border-b-4 border-brand-red pb-3 font-sans text-3xl font-bold uppercase text-brand-redDark">
          {categoryType === "REENACTMENT" ? "CHỈNH SỬA NỘI DUNG PHỤC DỰNG" : "CHỈNH SỬA QUÂN TRANG"}
      </h1>

      <form onSubmit={handleSubmit} className="admin-edit-form space-y-7 border border-[#ddd] bg-white p-7 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">{categoryType === "REENACTMENT" ? "Tiêu đề nội dung *" : "Tên hiện vật *"}</label>
            <input
              className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 block text-lg font-bold text-brand-text">{categoryType === "REENACTMENT" ? "Lực lượng *" : "Danh mục quân trang *"}</label>
            <select
              className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg outline-none transition-all"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, period: "" })}
              required
            >
              <option value="">{categoryType === "REENACTMENT" ? "Chọn lực lượng" : "Chọn danh mục"}</option>
              {visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.categoryName}</option>)}
            </select>
          </div>

          {categoryType === "REENACTMENT" && <div className="md:col-span-2">
            <label className="mb-3 block text-lg font-bold text-brand-text">Giai đoạn lịch sử *</label>
            <select className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg outline-none transition-all" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} required>
              <option value="">-- Chọn giai đoạn --</option>
              {visiblePeriods.map((period: any) => { const value = period.slug || slugifyPeriod(period.categoryName); return <option key={period.id} value={value}>{period.categoryName}</option>; })}
            </select>
          </div>}

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">Mô tả</label>
            <textarea
              className="w-full border-2 border-brand-red/30 rounded-xl p-4 h-32 text-lg focus:ring-4 focus:ring-brand-yellow outline-none resize-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">{categoryType === "REENACTMENT" ? "Nội dung chi tiết" : "Lịch sử sử dụng"}</label>
            <textarea
              className="min-h-48 w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow outline-none resize-y transition-all"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">Quốc gia *</label>
            <select
              className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all bg-white"
              value={formData.countryId}
              onChange={(e) => setFormData({ ...formData, countryId: Number(e.target.value), ...(categoryType === "REENACTMENT" ? { categoryId: "", period: "" } : {}) })}
              required
            >
              <option value="">-- Chọn quốc gia --</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.countryName}
                </option>
              ))}
            </select>
            {uniform.country && (
              <p className="mt-2 text-sm text-brand-text/70">
                Quốc gia hiện tại: <strong>{uniform.country.countryName}</strong>
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-4">Ảnh hiện tại</label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {existingImages.map((image, idx) => (
                    <div
                      key={image.id || idx}
                    className="group relative overflow-hidden rounded-xl border-2 border-brand-yellow/30 shadow-pop"
                  >
                    <img src={image.imageUrl} alt={`existing-${idx}`} className="aspect-[4/3] w-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(image)} className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity hover:bg-red-800 group-hover:opacity-100" aria-label="Xóa ảnh"><X size={15} /></button>
                    <div className="bg-white p-2">
                      <input
                        value={image.description || ""}
                        onChange={(event) => setExistingImages((current) => current.map((item) => item.id === image.id
                          ? { ...item, description: event.target.value }
                          : item))}
                        placeholder="Chú thích ảnh (tùy chọn)"
                        className="w-full rounded border border-brand-red/20 px-2 py-1 text-xs outline-none focus:border-brand-red"
                      />
                      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-semibold text-brand-redDark">
                        <input
                          type="checkbox"
                          checked={Boolean(image.sensitive)}
                          onChange={(event) => setExistingImages((current) => current.map((item) => item.id === image.id ? { ...item, sensitive: event.target.checked } : item))}
                        />
                        Ảnh nhạy cảm / cần đăng nhập
                      </label>
                      <button
                        type="button"
                        onClick={() => saveExistingDescription(image)}
                        disabled={savingImageId === image.id}
                        className="mt-2 w-full rounded bg-brand-red px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingImageId === image.id ? "Đang lưu..." : "Lưu chú thích"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-text/60 italic">Chưa có ảnh nào cho quân trang này</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">
              Thêm ảnh mới (Tổng số ảnh không vượt quá 5)
            </label>
            <div className="border-4 border-dashed border-brand-red/30 rounded-3xl p-10 text-center hover:border-brand-yellow transition-all relative group cursor-pointer bg-brand-bg/50">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {newPreviewUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {newPreviewUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl border border-brand-red/15 bg-white p-2 group">
                      <img
                        src={url}
                        alt={`new-preview-${idx}`}
                        className="w-full h-32 object-cover rounded-xl shadow"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPreview(idx)}
                        className="absolute right-3 top-3 z-20 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                      <input
                        value={newImageDescriptions[idx] || ""}
                        onChange={(event) => setNewImageDescriptions((prev) => prev.map((caption, i) => i === idx ? event.target.value : caption))}
                        onClick={(event) => event.stopPropagation()}
                        placeholder="Chú thích ảnh (tùy chọn)"
                        className="relative z-20 mt-2 w-full rounded-lg border border-brand-red/20 px-3 py-2 text-sm outline-none focus:border-brand-red"
                      />
                      <label className="relative z-20 mt-2 flex cursor-pointer items-center gap-2 text-left text-xs font-semibold text-brand-redDark" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={Boolean(newImageSensitive[idx])}
                          onChange={(event) => setNewImageSensitive((prev) => prev.map((value, i) => i === idx ? event.target.checked : value))}
                        />
                        Ảnh nhạy cảm / cần đăng nhập
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <UploadCloud size={64} className="mx-auto mb-4 text-brand-red/60 group-hover:text-brand-yellow transition-colors" />
                  <p className="text-lg font-medium text-brand-text/70 group-hover:text-brand-yellow">
                    Click hoặc kéo thả ảnh mới (tối đa 5MB mỗi ảnh)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-6 pt-8 border-t border-brand-red/20">
          <button
            type="button"
            onClick={() => navigate(redirectPath)}
            className="px-8 py-3 rounded-xl font-bold text-brand-text hover:bg-brand-bg transition-colors"
          >
            Hủy
          </button>
          <Button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="px-10 py-3 bg-brand-red text-white rounded-xl font-bold shadow-pop hover:bg-brand-redDark hover:shadow-pop-hover disabled:opacity-50 flex items-center gap-3 transition-all"
          >
            {saving && <Loader2 className="animate-spin" size={22} />}
            {saving ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </form>
      <style>{`
        .admin-edit-form input, .admin-edit-form select, .admin-edit-form textarea {
          border: 1px solid #bbb; background: #fff; padding: 12px 14px;
          color: #333; outline: none; border-radius: 0;
        }
        .admin-edit-form input:focus, .admin-edit-form select:focus, .admin-edit-form textarea:focus {
          border-color: #b51f24; box-shadow: 0 0 0 2px rgba(181,31,36,.12);
        }
      `}</style>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border-4 border-brand-yellow/30">
            <h3 className="text-2xl font-display font-black text-brand-redDark mb-6 text-center">
              XÁC NHẬN THAY ĐỔI
            </h3>
            <p className="text-brand-text mb-8 text-center">
              Bạn có chắc chắn muốn lưu thay đổi cho {categoryType === "REENACTMENT" ? "nội dung phục dựng" : "quân trang"} này không?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-8 py-3 rounded-xl font-bold text-brand-text hover:bg-brand-bg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="px-8 py-3 bg-brand-red text-white rounded-xl font-bold shadow-pop hover:bg-brand-redDark hover:shadow-pop-hover disabled:opacity-50 flex items-center gap-3 transition-all"
              >
                {saving && <Loader2 className="animate-spin" size={20} />}
                {saving ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border-2 border-green-400/30">
            <CheckCircle size={24} className="text-white" />
            <span className="font-medium text-base">Cập nhật thành công!</span>
          </div>
        </div>
      )}
    </div>
  );
}
