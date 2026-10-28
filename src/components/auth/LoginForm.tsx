import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, LockKeyhole } from "lucide-react";

interface LoginFormProps {
  onLoggedIn: () => void;
}

export default function LoginForm({ onLoggedIn }: LoginFormProps) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError(uiText("Vui lòng nhập tên đăng nhập và mật khẩu."));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await authApi.login(username.trim(), password);
      authApi.saveToken(result.token, result.userInfo);
      login(result.token, result.userInfo);
      onLoggedIn();
      // Public pages may have received a protected image without its URL.
      // Reload once after login so that the API request is repeated with JWT.
      window.setTimeout(() => window.location.reload(), 0);
    } catch (err: any) {
      const responseData = err.response?.data;
      setError(
        typeof responseData === "string"
          ? responseData
          : uiText("Tên đăng nhập hoặc mật khẩu không đúng."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <LockKeyhole className="mx-auto mb-3 text-brand-red" size={34} />
        <h2 className="font-display text-2xl font-black uppercase text-brand-redDark">
          {uiText("Đăng nhập để xem ảnh")}
        </h2>
        <p className="mt-2 text-sm text-brand-text/70">
          {uiText("Ảnh này được giới hạn cho thành viên đã đăng nhập.")}
        </p>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-r-md border-l-4 border-brand-red bg-red-50 p-3 text-sm font-bold text-brand-redDark">
          <AlertTriangle className="shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}
      <input
        className="input-style"
        placeholder={uiText("Tên đăng nhập")}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        className="input-style"
        type="password"
        placeholder={uiText("Mật khẩu")}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
      />
      <Button
        className="w-full bg-brand-redDark py-3 text-white hover:bg-brand-red"
        onClick={submit}
        disabled={loading}
      >
        {loading ? uiText("ĐANG ĐĂNG NHẬP...") : uiText("ĐĂNG NHẬP")}
      </Button>
      <div className="flex justify-between text-sm font-bold">
        <button
          type="button"
          className="auth-inline-link text-gray-500 hover:text-brand-red"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("openForgotPasswordModal"))
          }
        >
          {uiText("Quên mật khẩu?")}
        </button>
        <button
          type="button"
          className="auth-inline-link text-gray-500 hover:text-brand-red"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("openRegisterModal"))
          }
        >
          {uiText("Đăng ký")}
        </button>
      </div>
    </div>
  );
}
