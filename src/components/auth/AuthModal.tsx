import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import RegisterForm from "./Register";
import ForgotPasswordForm from "./ForgotPassword";
import ResetPasswordForm from "./ResetPasswordForm";
import LoginForm from "./LoginForm";

export type AuthView = "LOGIN" | "REGISTER" | "FORGOT" | "RESET";

interface AuthModalProps {
  onClose: () => void;
  initialView?: AuthView;
  resetToken?: string | null;
}

export default function AuthModal({
  onClose,
  initialView = "REGISTER",
  resetToken,
}: AuthModalProps) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const view = initialView;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={uiText("Đóng")}
        className="absolute inset-0 cursor-default bg-brand-redDark/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden border border-[#d7d7d7] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={uiText("Đóng")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center bg-[#f1f1f1] font-bold text-[#555] transition-colors hover:bg-[#c62828] hover:text-white"
        >
          ✕
        </button>

        <div className="p-8 pt-10">
          {view === "REGISTER" && (
            <RegisterForm onSwitchLogin={onClose} onRegistered={onClose} />
          )}

          {view === "LOGIN" && <LoginForm onLoggedIn={onClose} />}

          {view === "FORGOT" && (
            <ForgotPasswordForm onSwitchLogin={onClose} onBackHome={onClose} />
          )}

          {view === "RESET" && (
            <ResetPasswordForm
              token={resetToken}
              onDone={onClose}
              onBackHome={onClose}
              embedded
            />
          )}
        </div>
      </div>

      <style>{`
        .input-style {
          width: 100%;
          border-radius: 0;
          background-color: #fff;
          border: 1px solid #ccc;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 400;
          color: #333;
          outline: none;
          transition: all 0.2s;
        }
        .input-style:focus {
          border-color: #c62828;
          box-shadow: 0 0 0 2px rgba(198, 40, 40, 0.12);
        }
        .input-style::placeholder { color: #aaa; font-weight: 400; }
        .auth-inline-link {
          appearance: none;
          box-shadow: none;
          outline: none;
          transition: color 150ms ease;
        }
        .auth-inline-link:hover,
        .auth-inline-link:focus,
        .auth-inline-link:active {
          background: transparent !important;
          box-shadow: none;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 4px; }
      `}</style>
    </div>
  );
}
