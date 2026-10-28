import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import type { ImgHTMLAttributes, MouseEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type SensitiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  sensitive?: boolean;
};

export default function SensitiveImage({
  sensitive = false,
  className = "",
  src,
  alt,
  ...props
}: SensitiveImageProps) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const { isAuthenticated } = useAuth();

  if (!sensitive || isAuthenticated) {
    return <img src={src} alt={alt} className={className} {...props} />;
  }

  const requestLogin = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("openLoginModal"));
  };

  return (
    <button
      type="button"
      onClick={requestLogin}
      className={`group relative block overflow-hidden bg-[#e8e5df] ${className}`}
      aria-label={uiText("Đăng nhập để xem ảnh nhạy cảm")}
    >
      <span className="block min-h-48 w-full bg-[#e8e5df]" aria-hidden="true" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 px-3 text-center text-white transition-colors group-hover:bg-black/55">
        <LockKeyhole size={25} />
        <span className="text-xs font-bold leading-tight">
          {uiText("Đăng nhập để xem ảnh")}
        </span>
      </span>
    </button>
  );
}
