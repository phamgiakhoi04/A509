import { apiError } from "@/utils/apiError";
// src/pages/admin/edit/EditReenactment.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import Button from "@/components/ui/Button";
import { UploadCloud, X, Loader2, ArrowLeft, CheckCircle, Globe } from "lucide-react";

export default function EditReenactment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [country, setCountry] = useState<any>(null);

  const [formData, setFormData] = useState({
    countryName: "",
    continent: "",
  });

  const [existingFlagUrl, setExistingFlagUrl] = useState<string | null>(null);
  const [newFlagFile, setNewFlagFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string>("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const countryData = await adminApi.getCountryById(Number(id));

        setCountry(countryData);

        setFormData({
          countryName: countryData.countryName || "",
          continent: countryData.continent || "",
        });

        setExistingFlagUrl(countryData.flagImageUrl || null);
      } catch (error: any) {
        alert(apiError(error, "Không thể tải thông tin quốc gia"));
        navigate("/admin/phuc-dung");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    };
  }, [id, navigate]);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh cờ tối đa 5MB");
        return;
      }
      setNewFlagFile(file);
      const preview = URL.createObjectURL(file);
      setNewPreviewUrl(preview);
    }
  };

  const removeNewPreview = () => {
    if (newPreviewUrl) {
      URL.revokeObjectURL(newPreviewUrl);
    }
    setNewFlagFile(null);
    setNewPreviewUrl("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.countryName.trim()) {
      alert("Tên quốc gia không được để trống");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
    setSaving(true);

    try {
      const payload = {
        countryName: formData.countryName.trim(),
        continent: formData.continent || "",
      };

      await adminApi.updateCountry(Number(id), payload, newFlagFile ?? undefined);

      setShowSuccessToast(true);
      setTimeout(() => navigate("/admin/phuc-dung"), 1500);
    } catch (error: any) {
      alert(apiError(error, "Lỗi khi cập nhật quốc gia"));
    } finally {
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

  if (!country) return null;

  return (
    <div className="admin-page mx-auto max-w-5xl bg-white p-8 font-body relative">
      <button
        onClick={() => navigate("/admin/phuc-dung")}
        className="mb-8 flex items-center gap-2 text-brand-text hover:text-brand-red transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Quay lại danh sách
      </button>

      <h1 className="mb-6 border-b-4 border-brand-red pb-3 font-sans text-3xl font-bold uppercase text-brand-redDark">
        CHỈNH SỬA PHỤC DỰNG
      </h1>

      <form onSubmit={handleSubmit} className="admin-edit-form space-y-7 border border-[#ddd] bg-white p-7 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">Tên Quốc gia *</label>
            <input
              className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
              value={formData.countryName}
              onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-brand-text mb-3">Châu lục</label>
            <input
              className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-all"
              value={formData.continent}
              onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-4">Cờ hiện tại</label>
            {existingFlagUrl || newPreviewUrl ? (
              <div className="relative inline-block rounded-xl overflow-hidden shadow-pop border-2 border-brand-yellow/30 w-48 h-32">
                <img
                  src={newPreviewUrl || existingFlagUrl || ""}
                  alt="National flag"
                  className="w-full h-full object-cover"
                />
                {newPreviewUrl && (
                  <button
                    type="button"
                    onClick={removeNewPreview}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-md"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-48 h-32 rounded-xl bg-brand-bg/50 border-2 border-dashed border-brand-red/30 flex items-center justify-center">
                <Globe size={48} className="text-brand-text/40" />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-brand-text mb-3">
              Thay đổi cờ quốc gia (tối đa 5MB)
            </label>
            <div className="border-4 border-dashed border-brand-red/30 rounded-3xl p-10 text-center hover:border-brand-yellow transition-all relative group cursor-pointer bg-brand-bg/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFlagChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {newPreviewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={newPreviewUrl}
                    alt="flag preview"
                    className="max-h-56 object-contain rounded-2xl shadow-pop"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Thay đổi</span>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud size={64} className="mx-auto mb-4 text-brand-red/60 group-hover:text-brand-yellow transition-colors" />
                  <p className="text-lg font-medium text-brand-text/70 group-hover:text-brand-yellow">
                    Click hoặc kéo thả ảnh cờ mới
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-6 pt-8 border-t border-brand-red/20">
          <button
            type="button"
            onClick={() => navigate("/admin/phuc-dung")}
            className="px-8 py-3 rounded-xl font-bold text-brand-text hover:bg-brand-bg transition-colors"
          >
            Hủy
          </button>
          <Button
            type="submit"
            disabled={saving || !formData.countryName.trim()}
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
              Bạn có chắc chắn muốn lưu thay đổi cho quốc gia này không?
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
