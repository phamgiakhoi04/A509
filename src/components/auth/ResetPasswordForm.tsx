import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { motion } from "framer-motion"; // Thư viện animation
import {
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface ResetPasswordFormProps {
  token?: string | null;
  onDone?: () => void;
  onBackHome?: () => void;
  embedded?: boolean;
}

export default function ResetPasswordForm({
  token: tokenProp,
  onDone,
  onBackHome,
  embedded = false,
}: ResetPasswordFormProps = {}) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token =
    tokenProp ?? searchParams.get("token") ?? searchParams.get("resetToken");

  // State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // --- VALIDATION LOGIC NÂNG CẤP ---
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Điều kiện tổng thể
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecialChar;
  const isConfirmMatch = password === confirmPassword && confirmPassword !== "";

  useEffect(() => {
    if (!token)
      setError(uiText("Liên kết không hợp lệ hoặc thiếu mã xác thực."));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isPasswordValid || !isConfirmMatch) return;

    setLoading(true);
    setError("");

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => (onDone ? onDone() : navigate("/")), 1800);
    } catch (err: any) {
      const message = err.response?.data;
      setError(
        uiLanguage === "vi" && typeof message === "string"
          ? message
          : uiText("Mã xác thực đã hết hạn hoặc không đúng."),
      );
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN KHI TOKEN LỖI ---
  if (!token) {
    return (
      <div
        className={
          embedded
            ? "flex items-center justify-center"
            : "min-h-screen bg-brand-bg flex items-center justify-center p-6"
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-red animate-pulse">
            <X size={40} />
          </div>
          <h1 className="text-2xl font-display font-black text-brand-redDark uppercase">
            {uiText("Liên kết lỗi")}
          </h1>
          <p className="text-brand-text mt-3 font-medium">
            {uiText("Đường dẫn bị thiếu mã Token hoặc đã hết hạn.")}
          </p>
          <button
            onClick={onBackHome || (() => navigate("/"))}
            className="mt-8 px-8 py-3 bg-brand-redDark text-white rounded-xl font-bold hover:bg-brand-red transition shadow-lg hover:shadow-xl w-full"
          >
            {uiText("Về trang chủ")}{" "}
          </button>
        </motion.div>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div
      className={
        embedded
          ? "flex items-center justify-center"
          : "min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden"
      }
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-lg overflow-hidden border border-[#d7d7d7] shadow-2xl relative z-10"
      >
        {/* Header Gradient */}
        <div className="bg-white p-6 pb-2 text-center text-brand-redDark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <Lock className="text-brand-red w-8 h-8 mx-auto mb-2" />
          <h1 className="text-2xl font-display font-black uppercase tracking-wide">
            {uiText("Đặt lại mật khẩu")}
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-2">
            {uiText("Thiết lập mật khẩu mới an toàn hơn")}
          </p>
        </div>

        <div className="p-8 lg:p-10">
          {success ? (
            // --- TRẠNG THÁI THÀNH CÔNG ---
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200"
              >
                <Check className="text-green-600 w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-display font-black text-green-700 uppercase mb-2">
                {uiText("Thành công!")}
              </h2>
              <p className="text-brand-text font-bold text-lg">
                {uiText("Mật khẩu đã được cập nhật.")}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6 bg-gray-50 py-2 rounded-full w-fit mx-auto px-6">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></span>
                {uiText("Đang chuyển về trang chủ...")}{" "}
              </div>
            </div>
          ) : (
            // --- FORM ---
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thông báo lỗi */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border-l-4 border-brand-red p-4 flex items-start gap-3 rounded-r-xl"
                >
                  <AlertTriangle
                    className="text-brand-red shrink-0 mt-0.5"
                    size={20}
                  />
                  <span className="text-sm font-bold text-brand-redDark">
                    {error}
                  </span>
                </motion.div>
              )}

              {/* Mật khẩu mới */}
              <div className="space-y-2">
                <label className="text-sm font-black text-brand-redDark uppercase ml-1">
                  {uiText("Mật khẩu mới")}
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-brand-bg/50 border-2 border-transparent rounded-xl font-bold focus:bg-white focus:border-brand-red outline-none transition-all placeholder:text-gray-400 text-brand-text pr-12 group-hover:bg-white group-hover:shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>

                {/* Checklist độ mạnh mật khẩu */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 mt-2 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    {uiText("Yêu cầu bảo mật:")}
                  </p>

                  <ValidationItem
                    isValid={hasMinLength}
                    text={uiText("Tối thiểu 8 ký tự")}
                  />
                  <ValidationItem
                    isValid={hasUppercase}
                    text={uiText("Có ít nhất 1 chữ hoa (A-Z)")}
                  />
                  <ValidationItem
                    isValid={hasSpecialChar}
                    text={uiText("Có ký tự đặc biệt (!@#...)")}
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <label className="text-sm font-black text-brand-redDark uppercase ml-1">
                  {uiText("Xác nhận lại")}
                </label>
                <div className="relative group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-5 py-4 bg-brand-bg/50 border-2 rounded-xl font-bold outline-none transition-all placeholder:text-gray-400 text-brand-text pr-12 ${
                      confirmPassword && !isConfirmMatch
                        ? "border-brand-red bg-red-50"
                        : "border-transparent focus:bg-white focus:border-brand-red group-hover:bg-white"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {confirmPassword && !isConfirmMatch && (
                  <p className="text-xs font-bold text-brand-red ml-2 flex items-center gap-1">
                    <X size={12} /> {uiText("Mật khẩu không khớp")}{" "}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !isConfirmMatch}
                className={`w-full py-4 rounded-xl font-black text-white text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                  loading || !isPasswordValid || !isConfirmMatch
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-brand-redDark hover:bg-brand-red hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    {uiText("ĐANG XỬ LÝ...")}
                  </span>
                ) : (
                  <>
                    {uiText("ĐẶT LẠI MẬT KHẨU")}{" "}
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Component phụ hiển thị dòng validation
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-sm transition-colors duration-300 ${isValid ? "text-green-600 font-bold" : "text-gray-400 font-medium"}`}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isValid ? "bg-green-100" : "bg-gray-200"}`}
      >
        {isValid ? (
          <Check size={12} strokeWidth={4} />
        ) : (
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        )}
      </div>
      <span>{text}</span>
    </div>
  );
}
