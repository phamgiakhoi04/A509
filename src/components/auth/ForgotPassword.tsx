import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { authApi } from "@/api/authApi";
import { Check, ArrowLeft, AlertTriangle } from "lucide-react";

interface Props {
  onSwitchLogin: () => void;
  onBackHome?: () => void;
}

export default function ForgotPassword({ onSwitchLogin, onBackHome }: Props) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleForgot = async () => {
    setError(""); // Reset lỗi cũ

    if (!email) {
      setError(uiText("Vui lòng nhập Email!"));
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(uiText("Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau."));
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN THÀNH CÔNG ---
  if (isSuccess) {
    return (
      <div className="text-center py-2 animate-fade-in space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-200 animate-bounce">
          <Check className="text-green-600 w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-display font-black text-green-700 uppercase">
            {uiText("Đã Gửi Yêu Cầu!")}
          </h2>
          <p className="text-brand-text font-bold mt-2 text-sm leading-relaxed">
            {uiText(
              "Nếu email hợp lệ, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
            )}{" "}
            <br />
            <span className="text-brand-redDark">{email}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2 italic">
            {uiText(
              "(Vui lòng kiểm tra cả hộp thư rác/spam nếu không thấy)",
            )}{" "}
          </p>
        </div>

        <Button
          className="w-full py-3 bg-brand-redDark text-white hover:bg-brand-red shadow-pop hover:shadow-pop-hover"
          onClick={onBackHome || onSwitchLogin}
        >
          {uiText("VỀ TRANG CHỦ")}{" "}
        </Button>
      </div>
    );
  }

  // --- GIAO DIỆN NHẬP EMAIL ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header đã bỏ dòng chữ thừa */}
      <div className="text-center">
        <h2 className="text-2xl font-display font-black text-brand-redDark uppercase">
          {uiText("Quên Mật Khẩu?")}
        </h2>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="bg-red-50 border-l-4 border-brand-red p-3 flex items-start gap-3 rounded-r-lg animate-pulse">
          <AlertTriangle className="text-brand-red shrink-0" size={20} />
          <span className="text-sm font-bold text-brand-redDark text-left">
            {error}
          </span>
        </div>
      )}

      <input
        className={`input-style ${error ? "border-brand-red bg-red-50" : ""}`}
        placeholder={uiText("Nhập email của bạn")}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleForgot()}
      />

      <Button
        className="w-full py-3 bg-brand-redDark text-white shadow-pop hover:bg-brand-red active:scale-95 transition-all"
        onClick={handleForgot}
        disabled={loading}
      >
        {loading ? uiText("ĐANG GỬI...") : uiText("GỬI YÊU CẦU")}
      </Button>

      <div className="flex justify-center mt-2">
        <button
          onClick={onBackHome || onSwitchLogin}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-red transition-colors"
        >
          <ArrowLeft size={16} /> {uiText("Về trang chủ")}{" "}
        </button>
      </div>
    </div>
  );
}
