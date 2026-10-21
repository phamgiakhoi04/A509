import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  return (
    <footer className="mt-8 border-t-4 border-[#a92323] bg-[#292929] text-white">
      {/* NOTE:
          Khu vực thông tin liên hệ.
      */}
      <div className="px-5 py-6">
        <div className="text-base font-bold uppercase">
          A509 - Research & Reenactment Group
        </div>

        <div className="mt-2 text-xs leading-5 text-[#ccc]">
          {language === "en" ? "Vietnamese historical reenactment and documentation project." : "Dự án tái hiện lịch sử và tư liệu Việt Nam."}
          <br />
          Email: a509vietnam@gmail.com
        </div>

        {/* NOTE:
            Social links.
            Giữ nguyên link hiện tại của project.
        */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href="https://www.facebook.com/A509VN"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f5c400] hover:underline"
          >
            Facebook
          </a>

          <a
            href="https://x.com/A509VN?s=20"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f5c400] hover:underline"
          >
            X
          </a>

          <a
            href="https://www.youtube.com/@A509VN"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f5c400] hover:underline"
          >
            YouTube
          </a>
        </div>
      </div>

      {/* NOTE:
          Copyright.
      */}
      <div className="border-t border-[#444] px-5 py-3 text-center text-[11px] text-[#aaa]">
        © {new Date().getFullYear()} A509 - {language === "en" ? "Vietnamese Historical Reenactment Project" : "Dự án tái hiện lịch sử Việt Nam"}
      </div>
    </footer>
  );
}
