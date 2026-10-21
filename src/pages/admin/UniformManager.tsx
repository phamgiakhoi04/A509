import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import Button from "@/components/ui/Button";
import { Plus, Trash2, Edit, UploadCloud, X, Loader2, CheckCircle } from "lucide-react";

type UniformManagerProps = {
  categoryType?: "UNIFORM" | "REENACTMENT";
  title?: string;
  editPathPrefix?: string;
  embedded?: boolean;
  initialCountryId?: number;
};
export default function UniformManager({
  categoryType = "UNIFORM",
  title = "Quản lý Quân trang",
  editPathPrefix = "/admin/quan-trang/edit",
  embedded = false,
  initialCountryId,
}: UniformManagerProps = {}) {
  const [items, setItems] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    history: "",
    countryId: 0,
    categoryId: "",
    periodCategoryId: "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [imageSensitive, setImageSensitive] = useState<boolean[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();
  const isReenactment = categoryType === "REENACTMENT";
  const itemLabel = isReenactment ? "nội dung phục dựng" : "quân trang";
  const inputTitle = isReenactment ? "TIÊU ĐỀ NỘI DUNG *" : "TÊN HIỆN VẬT *";
  const visibleCategories = isReenactment
    ? categories.filter((category) => Number(category.countryId) === Number(formData.countryId))
    : categories;
  const selectedForce = visibleCategories.find((category) => String(category.id) === String(formData.categoryId));
  const visiblePeriods = isReenactment ? (selectedForce?.children || []) : [];
  const allPeriods = categories.flatMap((category) => category.children || []);

  useEffect(() => {
    fetchItems();
    fetchCountries();
    fetchCategories();
  }, [categoryType, initialCountryId]);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        setToastMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const fetchItems = async () => {
    try {
      const data = await adminApi.getAllUniforms();
      const scoped = categoryType === "REENACTMENT"
        ? (data || []).filter((item: any) => item.category?.categoryType === "REENACTMENT" && (!initialCountryId || Number(item.country?.id) === Number(initialCountryId)))
        : (data || []).filter((item: any) => !item.category?.categoryType || item.category?.categoryType === "UNIFORM");
      setItems(scoped);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await adminApi.getAllCountries();
      setCountries(data || []);
      if (data?.length) {
        setFormData((prev) => ({ ...prev, countryId: prev.countryId || initialCountryId || Number(data[0].id) }));
      }
    } catch (error) {
      console.error("Lỗi tải danh sách quốc gia:", error);
    }
  };

  useEffect(() => {
    if (isReenactment && initialCountryId) {
      setFormData((prev) => ({ ...prev, countryId: initialCountryId, categoryId: "" }));
    }
  }, [initialCountryId, isReenactment]);

  const fetchCategories = async () => {
    try {
      const data = categoryType === "REENACTMENT"
        ? await adminApi.getRootCategoriesByType("REENACTMENT")
        : await adminApi.getCategoriesByType(categoryType);
      const usable = categoryType === "REENACTMENT"
        ? ((data || []).find((item: any) => item.categoryName === "Phục dựng trang phục") || (data || [])[0])?.children || []
        : (data || []);
      setCategories(usable);
      if (!isReenactment && usable.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: prev.categoryId || String(usable[0].id),
        }));
      }
    } catch (error) {
      console.error("Lỗi tải danh sách loại quân trang:", error);
    }
  };

  useEffect(() => {
    if (!isReenactment || !formData.categoryId) return;
    const belongsToCountry = visibleCategories.some((category) => String(category.id) === String(formData.categoryId));
    if (!belongsToCountry) setFormData((prev) => ({ ...prev, categoryId: "" }));
  }, [formData.countryId, formData.categoryId, categories, isReenactment]);

  useEffect(() => {
    if (!isReenactment || !formData.periodCategoryId) return;
    if (!visiblePeriods.some((period: any) => String(period.id) === formData.periodCategoryId)) {
      setFormData((prev) => ({ ...prev, periodCategoryId: "" }));
    }
  }, [formData.categoryId, formData.countryId, formData.periodCategoryId, categories, isReenactment]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      alert("Mỗi ảnh tối đa 5MB");
      return;
    }
    if (files.length + selectedImages.length > 5) {
      alert(`Tối đa 5 ảnh cho một ${itemLabel}`);
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    setImageDescriptions((prev) => [...prev, ...files.map(() => "")]);
    setImageSensitive((prev) => [...prev, ...files.map(() => false)]);
  };

  const removePreview = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImageDescriptions((prev) => prev.filter((_, i) => i !== index));
    setImageSensitive((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("history", formData.history || "");
      formDataToSend.append("countryId", formData.countryId.toString());
      if (!formData.categoryId) {
        alert(`Vui lòng chọn lực lượng/danh mục cho ${itemLabel}`);
        setLoading(false);
        return;
      }
      if (isReenactment && !visibleCategories.some((category) => String(category.id) === String(formData.categoryId))) {
        alert("Lực lượng không thuộc quốc gia đang chọn.");
        setLoading(false);
        return;
      }
      if (!formData.countryId) {
        alert("Vui lòng chọn quốc gia");
        setLoading(false);
        return;
      }
      if (isReenactment && !formData.periodCategoryId) {
        alert("Vui lòng chọn giai đoạn lịch sử");
        setLoading(false);
        return;
      }
      if (isReenactment && selectedImages.length === 0) {
        alert("Nội dung phục dựng cần có ít nhất một ảnh để hiển thị trên website");
        setLoading(false);
        return;
      }
      formDataToSend.append("categoryId", formData.categoryId);
      if (categoryType === "REENACTMENT") {
        const period = visiblePeriods.find((item: any) => String(item.id) === formData.periodCategoryId);
        formDataToSend.append("periodCategoryId", formData.periodCategoryId);
        if (period?.slug) formDataToSend.append("period", period.slug);
      }

      selectedImages.forEach((file) => {
        formDataToSend.append("imageFiles", file);
      });
      imageDescriptions.forEach((description) => {
        formDataToSend.append("imageDescriptions", description);
      });
      imageSensitive.forEach((sensitive) => {
        formDataToSend.append("imageSensitive", String(sensitive));
      });

      await adminApi.createUniform(formDataToSend);

      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        history: "",
        countryId: countries[0]?.id ? Number(countries[0].id) : 0,
        categoryId: isReenactment ? "" : (categories[0]?.id ? String(categories[0].id) : ""),
        periodCategoryId: "",
      });
      setSelectedImages([]);
      setPreviewUrls([]);
      setImageDescriptions([]);
      setImageSensitive([]);

      setToastMessage(`Đã thêm ${itemLabel} thành công!`);
      setShowSuccessToast(true);

      fetchItems();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data || `Lỗi khi lưu ${itemLabel}`);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setShowDeleteModal(false);
    try {
      await adminApi.deleteUniform(deleteId);
      setToastMessage(`Đã xóa ${itemLabel} thành công!`);
      setShowSuccessToast(true);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data || "Không thể xóa (có thể có dữ liệu liên quan)");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className={embedded ? "space-y-6 font-body relative" : "admin-page space-y-8 p-8 font-body relative"}>
      <div className="flex items-center justify-between gap-6">
        <h1 className="whitespace-nowrap text-3xl font-display font-black text-brand-redDark uppercase tracking-wide">
          {title}
        </h1>
        <Button
          onClick={() => {
            if (!countries.length) return alert("Hãy hoàn tất bước 1: tạo ít nhất một quốc gia trước.");
            if (!visibleCategories.length) return alert("Quốc gia này chưa có lực lượng phục dựng.");
            if (isReenactment && !visiblePeriods.length) return alert("Lực lượng này chưa có giai đoạn. Hãy tạo giai đoạn trước.");
            setShowForm(true);
          }}
          className="shrink-0 bg-brand-red text-white px-5 py-3 rounded-xl font-bold shadow-pop hover:bg-brand-redDark hover:shadow-pop-hover transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={22} /> {isReenactment ? "Thêm nội dung" : "Thêm mới"}
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-10 relative max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-brand-yellow/30">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-brand-text hover:text-brand-red transition-colors"
            >
              <X size={32} />
            </button>

            <h2 className="text-3xl font-display font-black text-brand-redDark mb-10 border-b-4 border-brand-yellow/40 pb-4">
              {isReenactment ? "THÊM NỘI DUNG PHỤC DỰNG" : "THÊM QUÂN TRANG MỚI"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">{inputTitle}</label>
                  <input
                    className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">Mở đầu / mô tả</label>
                  <textarea
                    className="w-full border-2 border-brand-red/30 rounded-xl p-4 h-32 text-lg focus:ring-4 focus:ring-brand-yellow outline-none resize-none transition-all"
                    placeholder={isReenactment ? "Đoạn giới thiệu hiển thị dưới tiêu đề..." : "Mô tả chi tiết..."}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">Nội dung chi tiết</label>
                  <textarea
                    className="min-h-48 w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow outline-none resize-y transition-all"
                    placeholder={isReenactment ? "Nội dung lịch sử, diễn giải và thông tin chi tiết..." : "Lịch sử..."}
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">Quốc gia *</label>
                  <select
                    className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all bg-white"
                    value={formData.countryId}
                    onChange={(e) => setFormData({ ...formData, countryId: Number(e.target.value), ...(isReenactment ? { categoryId: "", periodCategoryId: "" } : {}) })}
                    required
                  >
                    <option value="">-- Chọn quốc gia --</option>
                    {countries.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.countryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">{isReenactment ? "Lực lượng *" : "Loại quân trang *"}</label>
                  <select
                    className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all bg-white"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, periodCategoryId: "" })}
                    required
                  >
                    <option value="">{isReenactment ? "Chọn lực lượng" : "Chọn loại quân trang"}</option>
                    {visibleCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {categoryType === "REENACTMENT" && <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">Giai đoạn lịch sử *</label>
                  <select className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg bg-white" value={formData.periodCategoryId} onChange={(e) => setFormData({ ...formData, periodCategoryId: e.target.value })} required>
                    <option value="">-- Chọn giai đoạn --</option>
                    {visiblePeriods.map((period: any) => <option key={period.id} value={period.id}>{period.categoryName}</option>)}
                  </select>
                </div>}

                <div className="md:col-span-2">
                  <label className="block text-lg font-bold text-brand-text mb-3">Hình ảnh {isReenactment ? "* " : ""}(tối đa 5 ảnh)</label>
                  <div className="border-4 border-dashed border-brand-red/30 rounded-3xl p-10 text-center hover:border-brand-yellow transition-all relative group cursor-pointer bg-brand-bg/50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {previewUrls.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="group relative rounded-xl border border-brand-red/15 bg-white p-2 shadow-sm">
                            <img
                              src={url}
                              alt={`preview-${idx}`}
                              className="h-36 w-full rounded-lg object-cover shadow"
                            />
                            <button
                              type="button"
                              onClick={() => removePreview(idx)}
                              className="absolute right-3 top-3 z-20 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity hover:bg-red-800 group-hover:opacity-100"
                            >
                              <X size={16} />
                            </button>
                            <input
                              value={imageDescriptions[idx] || ""}
                              onChange={(event) => setImageDescriptions((prev) => prev.map((caption, i) => i === idx ? event.target.value : caption))}
                              onClick={(event) => event.stopPropagation()}
                              placeholder="Chú thích ảnh (tùy chọn)"
                              className="relative z-20 mt-2 w-full rounded-lg border border-brand-red/20 px-3 py-2 text-sm outline-none focus:border-brand-red"
                            />
                            <label className="relative z-20 mt-2 flex cursor-pointer items-center gap-2 text-left text-xs font-semibold text-brand-redDark" onClick={(event) => event.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={Boolean(imageSensitive[idx])}
                                onChange={(event) => setImageSensitive((prev) => prev.map((value, i) => i === idx ? event.target.checked : value))}
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
                          Click hoặc kéo thả ảnh (tối đa 5MB mỗi ảnh)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-8 border-t border-brand-red/20">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 rounded-xl font-bold text-brand-text hover:bg-brand-bg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-brand-red text-white rounded-xl font-bold shadow-pop hover:bg-brand-redDark hover:shadow-pop-hover disabled:opacity-50 flex items-center gap-3 transition-all"
                >
                  {loading && <Loader2 className="animate-spin" size={22} />}
                  {loading ? "Đang lưu..." : `Lưu ${isReenactment ? "nội dung" : "quân trang"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-pop overflow-hidden border-2 border-brand-red/10 overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="bg-brand-bg text-brand-redDark text-sm font-bold uppercase tracking-wider">
            <tr>
              <th className="p-5">ID</th>
              <th className="p-5">Ảnh</th>
              <th className="p-5">{isReenactment ? "Nội dung" : "Tên hiện vật"}</th>
              <th className="p-5">Quốc gia</th>
              {isReenactment && <th className="p-5">Lực lượng</th>}
              {isReenactment && <th className="p-5">Giai đoạn</th>}
              <th className="p-5">Mô tả</th>
              <th className="p-5">Ngày tạo</th>
              <th className="p-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-red/10">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-brand-bg/60 transition-colors">
                <td className="p-5 text-brand-text font-mono">#{item.id}</td>
                <td className="p-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-bg border-2 border-brand-yellow/30 shadow-pop">
                    {item.images?.[0]?.imageUrl ? (
                      <img src={item.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-brand-text/50">No img</div>
                    )}
                  </div>
                </td>
                <td className="p-5 font-bold text-brand-text text-lg max-w-[200px]">
                  <div className="line-clamp-2">{item.name}</div>
                </td>
                <td className="p-5 text-brand-text/70">{item.country?.countryName || "-"}</td>
                {isReenactment && <td className="p-5 text-brand-text/70">{item.category?.categoryName || "-"}</td>}
                {isReenactment && <td className="p-5 text-brand-text/70">{item.periodCategory?.categoryName || allPeriods.find((period: any) => period.slug === item.period)?.categoryName || item.period || "-"}</td>}
                <td className="p-5 text-brand-text/70 max-w-[250px]">
                  <div className="line-clamp-3">{item.description || "-"}</div>
                </td>
                <td className="p-5 text-brand-text/70 whitespace-nowrap">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td className="p-5 text-right space-x-3">
                  <button
                    onClick={() => navigate(`${editPathPrefix}/${item.id}`)}
                    className="p-3 text-brand-yellow hover:bg-brand-yellow/20 rounded-xl transition-colors"
                  >
                    <Edit size={22} />
                  </button>
                  <button
                    onClick={() => requestDelete(item.id)}
                    className="p-3 text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={22} />
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={isReenactment ? 10 : 8} className="p-16 text-center text-brand-text/50 italic text-xl">
                  {isReenactment ? "Chưa có nội dung phục dựng nào" : "Chưa có quân trang nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border-4 border-brand-yellow/30">
            <h3 className="text-2xl font-display font-black text-brand-redDark mb-6 text-center">
              XÁC NHẬN XÓA
            </h3>
            <p className="text-brand-text mb-8 text-center">
              Bạn có chắc chắn muốn xóa {itemLabel} này? Hành động không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-8 py-3 rounded-xl font-bold text-brand-text hover:bg-brand-bg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-8 py-3 bg-brand-red text-white rounded-xl font-bold shadow-pop hover:bg-brand-redDark hover:shadow-pop-hover transition-all"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border-2 border-green-400/30">
            <CheckCircle size={24} className="text-white" />
            <span className="font-medium text-base">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
