import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { authApi, type RegisterRequest } from "@/api/authApi";
import { Check, AlertTriangle } from "lucide-react";

interface Props {
  onSwitchLogin: () => void;
  onRegistered?: () => void;
}

export default function Register({ onSwitchLogin, onRegistered }: Props) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State lưu lỗi
  const [success, setSuccess] = useState(false); // State thành công

  const handleRegister = async () => {
    // Reset lỗi cũ
    setError("");

    // Validate cơ bản
    if (!username || !password || !email) {
      setError(uiText("Vui lòng điền đủ thông tin bắt buộc !"));
      return;
    }

    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError(
        uiLanguage === "en"
          ? "Use at least 8 characters and up to 72 UTF-8 bytes for your password."
          : "Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte UTF-8.",
      );
      return;
    }
    setLoading(true);
    try {
      const payload: RegisterRequest = { username, password, email, fullName };
      await authApi.register(payload);

      // Thành công -> Bật giao diện Success
      setSuccess(true);
    } catch (err: any) {
      // Thất bại -> Hiện lỗi màu đỏ
      const responseData = err.response?.data;
      const message =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ||
            uiText("Đăng ký thất bại. Vui lòng thử lại.");
      setError(
        uiLanguage === "en"
          ? "Registration failed. Check your username, email and password (at least 8 characters, up to 72 UTF-8 bytes)."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN THÀNH CÔNG ---
  if (success) {
    return (
      <div className="text-center py-6 animate-fade-in space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-200 animate-bounce">
          <Check className="text-green-600 w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-display font-black text-green-700 uppercase">
            {uiText("Đăng Ký Thành Công!")}
          </h2>
          <p className="text-brand-text font-bold mt-2 text-sm">
            {uiText("Tài khoản")}{" "}
            <span className="text-brand-redDark">{username}</span>{" "}
            {uiText("đã được tạo.")}{" "}
          </p>
        </div>

        <Button
          className="w-full py-3 bg-brand-redDark text-white hover:bg-brand-red shadow-pop hover:shadow-pop-hover mt-4"
          onClick={onRegistered || onSwitchLogin}
        >
          {uiText("VỀ TRANG CHỦ")}{" "}
        </Button>
      </div>
    );
  }

  // --- GIAO DIỆN ĐĂNG KÝ ---
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-display font-black text-brand-redDark uppercase">
          {uiText("Tạo Tài Khoản")}
        </h2>
      </div>

      {/* Hiển thị lỗi ngay trong form */}
      {error && (
        <div className="bg-red-50 border-l-4 border-brand-red p-3 flex items-start gap-2 rounded-r-md animate-pulse">
          <AlertTriangle className="text-brand-red w-5 h-5 shrink-0" />
          <span className="text-sm font-bold text-brand-redDark text-left leading-tight">
            {error}
          </span>
        </div>
      )}

      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
        <input
          className="input-style"
          placeholder={uiText("Tên đăng nhập *")}
          maxLength={64}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input-style"
          placeholder="Email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input-style"
          type="password"
          minLength={8}
          maxLength={72}
          placeholder={uiText("Mật khẩu *")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="input-style"
          placeholder={uiText("Họ và tên")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <Button
        // Đã đổi màu thành Đỏ (brand-redDark) và chữ Trắng
        className="w-full py-3 mt-2 bg-brand-redDark text-white hover:bg-brand-red shadow-pop hover:shadow-pop-hover transition-all active:scale-95"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? uiText("ĐANG TẠO...") : uiText("ĐĂNG KÝ NGAY")}
      </Button>

      <div className="text-center text-sm font-bold text-brand-text/80">
        {uiText("Đã có tài khoản?")}{" "}
        <button
          type="button"
          onClick={onRegistered || (() => window.location.assign("/"))}
          className="auth-inline-link inline border-0 bg-transparent p-0 align-baseline text-sm font-bold leading-normal text-gray-500 transition-colors hover:bg-transparent hover:text-brand-red focus:bg-transparent active:bg-transparent"
        >
          {uiText("Đăng nhập")}{" "}
        </button>
      </div>
    </div>
  );
}
