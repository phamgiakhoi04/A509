import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { authApi } from "@/api/authApi";
import type { User } from "@/types/models";
import {
  X,
  Camera,
  User as UserIcon,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  user: User;
  onClose: () => void;
  onUpdateSuccess: (updatedUser: User) => void;
}

export default function Profile({ user, onClose, onUpdateSuccess }: Props) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(uiText("Vui lòng chọn tệp hình ảnh."));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(uiText("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB."));
      event.target.value = "";
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setAvatarPreview((previousPreview) => {
      if (previousPreview.startsWith("blob:")) {
        URL.revokeObjectURL(previousPreview);
      }
      return nextPreview;
    });
    setSelectedFile(file);
    setError("");
    setSuccessMsg("");
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError(uiText("Vui lòng chọn ảnh đại diện mới."));
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const updatedData = await authApi.updateProfile({
        avatarFile: selectedFile,
      });

      const freshAvatarUrl = updatedData.avatarUrl
        ? `${updatedData.avatarUrl}${updatedData.avatarUrl.includes("?") ? "&" : "?"}v=${Date.now()}`
        : user.avatarUrl;
      const updatedUser: User = {
        ...user,
        ...updatedData,
        avatarUrl: freshAvatarUrl,
      };

      const token = localStorage.getItem("ACCESS_TOKEN");
      if (token) {
        authApi.saveToken(token, updatedUser);
      }
      onUpdateSuccess(updatedUser);

      setAvatarPreview(freshAvatarUrl || "");
      setSelectedFile(null);
      setSuccessMsg(uiText("Đã cập nhật ảnh đại diện!"));

      window.setTimeout(onClose, 900);
    } catch (err: any) {
      const responseData = err.response?.data;
      const message =
        typeof responseData === "string"
          ? responseData
          : responseData?.message || uiText("Không thể cập nhật ảnh đại diện.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-redDark/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden border border-[#d7d7d7] border-t-4 border-t-brand-red animate-fade-in flex flex-col md:flex-row max-h-[90vh]">
        <div className="bg-[#f5f5f5] md:w-2/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 shrink-0 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-redDark"></div>

          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-brand-red bg-white overflow-hidden shadow-lg">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-bg text-brand-redDark font-black text-5xl">
                  {(user.username?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>

            <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white mb-1" size={32} />
              <span className="text-[10px] text-white font-bold uppercase">
                {uiText("Đổi ảnh")}{" "}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <h3 className="font-display font-black text-xl text-brand-redDark uppercase text-center break-words w-full px-2">
            {user.fullName || user.username}
          </h3>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-20">
            <h2 className="text-lg font-display font-black text-brand-redDark uppercase flex items-center gap-2">
              <UserIcon size={20} className="text-brand-yellow" />{" "}
              {uiText("Cập nhật ảnh đại diện")}{" "}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-brand-red hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 pt-4">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-brand-red text-brand-redDark text-sm font-bold rounded-r flex items-center gap-2">
                <AlertCircle size={20} className="shrink-0" /> {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm font-bold rounded-r flex items-center gap-2">
                <CheckCircle2 size={20} className="shrink-0" /> {successMsg}
              </div>
            )}
          </div>

          <div className="p-6 flex-1">
            <div className="border border-dashed border-gray-300 bg-[#fafafa] p-5 text-center text-sm leading-relaxed text-gray-600">
              {uiText(
                "Chọn ảnh mới bằng cách di chuột lên ảnh đại diện. Chỉ có ảnh đại diện được thay đổi; tên, email và các thông tin khác vẫn giữ nguyên.",
              )}{" "}
            </div>
            {(user.roleName === "ADMIN" ||
              user.roles?.some((role) => role.name === "ADMIN")) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/admin/dashboard");
                }}
                className="mt-4 w-full border border-brand-red bg-white px-4 py-3 text-sm font-black text-brand-redDark transition-colors hover:bg-brand-red hover:text-white"
              >
                {uiText("ĐI TỚI KHU VỰC ĐĂNG NỘI DUNG / ẢNH")}{" "}
              </button>
            )}
          </div>

          <div className="p-5 border-t border-gray-200 bg-[#f5f5f5] shrink-0">
            <Button
              onClick={handleSave}
              disabled={loading || !selectedFile}
              className="w-full py-3.5 bg-brand-redDark text-white font-black text-lg shadow-pop hover:shadow-pop-hover active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                uiText("ĐANG LƯU...")
              ) : (
                <>
                  <Save size={20} /> {uiText("LƯU ẢNH")}{" "}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
