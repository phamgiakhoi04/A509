import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// MENU CHÍNH

const navLinks = [
  {
    to: "/gioi-thieu",
    label: "GIỚI THIỆU",
  },

  {
    to: "/hoat-dong",
    label: "HOẠT ĐỘNG",
    hasDropdown: true,
    dropdownItems: [
      { to: "/hoat-dong/phuc-dung", label: "Phục dựng" },
      { to: "/hoat-dong/nghien-cuu", label: "Nghiên cứu" },
    ],
  },

  {
    to: "/tai-lieu",
    label: "TÀI LIỆU",
    hasDropdown: true,
    dropdownItems: [
      {
        to: "/tai-lieu/quan-trang",
        label: "Quân trang",
      },
      {
        to: "/tai-lieu/anh-tu-lieu",
        label: "Ảnh tư liệu",
      },
      {
        to: "/tai-lieu/hoi-uc-ccb",
        label: "Hồi ức CCB",
      },
      {
        to: "/tai-lieu/thu-vien",
        label: "Thư viện",
      },
      {
        to: "/tai-lieu/nghien-cuu",
        label: "Từ điển",
      },
    ],
  },

  {
    to: "/tin-tuc",
    label: "TIN TỨC",
    hasDropdown: true,
    dropdownItems: [
      {
        to: "/tin-tuc/thoi-su",
        label: "Thời sự",
      },
      {
        to: "/tin-tuc/phong-su",
        label: "Phóng sự",
      },
    ],
  },

  {
    to: "/kham-pha",
    label: "KHÁM PHÁ",
    hasDropdown: true,
    dropdownItems: [
      { to: "/kham-pha/tim-hieu", label: "Tìm hiểu" },
      { to: "/kham-pha/diy", label: "DIY" },
      { to: "/kham-pha/cac-van-de", label: "Các vấn đề" },
    ],
  },

  {
    to: "/van-hoa",
    label: "VĂN HÓA",
    hasDropdown: true,
    dropdownItems: [
      { to: "/van-hoa/trong-nuoc", label: "Trong nước" },
      { to: "/van-hoa/ngoai-nuoc", label: "Ngoài nước" },
    ],
  },

  {
    to: "/lien-he",
    label: "LIÊN HỆ",
  },
];

const englishNavLabels: Record<string, string> = {
  "/gioi-thieu": "ABOUT",
  "/hoat-dong": "ACTIVITIES",
  "/tai-lieu": "RESOURCES",
  "/tin-tuc": "NEWS",
  "/kham-pha": "EXPLORE",
  "/van-hoa": "CULTURE",
  "/lien-he": "CONTACT",
};

const englishDropdownLabels: Record<string, string> = {
  "/hoat-dong/phuc-dung": "UNIFORM REENACTMENT",
  "/hoat-dong/nghien-cuu": "RESEARCH",
  "/tai-lieu/quan-trang": "UNIFORMS",
  "/tai-lieu/anh-tu-lieu": "ARCHIVAL PHOTOS",
  "/tai-lieu/hoi-uc-ccb": "VETERANS’ MEMOIRS",
  "/tai-lieu/thu-vien": "LIBRARY",
  "/tai-lieu/nghien-cuu": "REFERENCE",
  "/tin-tuc/thoi-su": "CURRENT AFFAIRS",
  "/tin-tuc/phong-su": "REPORTS",
  "/kham-pha/tim-hieu": "LEARN",
  "/kham-pha/diy": "DIY",
  "/kham-pha/cac-van-de": "TOPICS",
  "/van-hoa/trong-nuoc": "DOMESTIC",
  "/van-hoa/ngoai-nuoc": "INTERNATIONAL",
};

// =====================================================
// HEADER
// =====================================================

function LanguageFlag({ language, small = false }: { language: "vi" | "en"; small?: boolean }) {
  const size = small ? "h-[15px] w-[23px]" : "h-[21px] w-[32px]";
  const starRows = Array.from({ length: 9 }, (_, row) => row);

  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/20 shadow-sm ${size}`}>
      <svg viewBox="0 0 30 20" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {language === "vi" ? (
          <>
            <rect width="30" height="20" fill="#DA251D" />
            <path d="m15 3.1 1.65 5.05h5.32l-4.31 3.12 1.65 5.05L15 13.2l-4.31 3.12 1.65-5.05-4.31-3.12h5.32L15 3.1Z" fill="#FFDE00" />
          </>
        ) : (
          <>
            <rect width="30" height="20" fill="#fff" />
            {Array.from({ length: 7 }, (_, stripe) => (
              <rect key={stripe} y={stripe * (40 / 13)} width="30" height={20 / 13} fill="#B22234" />
            ))}
            <rect width="12.5" height="10.8" fill="#3C3B6E" />
            {starRows.flatMap((row) => {
              const count = row % 2 === 0 ? 6 : 5;
              const spacing = 11.25 / count;
              return Array.from({ length: count }, (_, column) => (
                <path
                  key={`${row}-${column}`}
                  d="m0-.62.15.43h.46l-.37.27.14.44L0 .25l-.38.27.14-.44-.37-.27h.46L0-.62Z"
                  fill="#fff"
                  transform={`translate(${0.62 + spacing * (column + 0.5) + (row % 2 ? spacing / 2 : 0)} ${0.65 + row * 1.18})`}
                />
              ));
            })}
          </>
        )}
        <rect x=".35" y=".35" width="29.3" height="19.3" rx="2.1" fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth=".7" />
      </svg>
    </span>
  );
}

function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const chooseLanguage = (next: "vi" | "en") => {
    setLanguage(next);
    setIsOpen(false);
  };

  return (
    <div className={mobile ? "relative mt-3 w-full" : "relative flex h-[50px] flex-none items-stretch border-l border-white/10"}>
      <button
        type="button"
        className={mobile
          ? "flex w-full items-center justify-center gap-2 border border-white/10 bg-[#333] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#444] hover:text-[#f5c400]"
          : "flex h-full items-center justify-center gap-2 whitespace-nowrap px-3 text-[15px] font-semibold tracking-[0.01em] text-white transition-colors hover:bg-[#444] hover:text-[#f5c400]"}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Choose language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <LanguageFlag language={language} />
        <span>{language === "en" ? "ENGLISH" : "TIẾNG VIỆT"}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div role="menu" aria-label="Other language" className={`absolute z-50 min-w-full border border-[#555] bg-black py-1 shadow-xl ${mobile ? "left-0 right-0 top-full" : "right-0 top-full"}`}>
          {language === "vi" ? (
            <button type="button" role="menuitem" onClick={() => chooseLanguage("en")} className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm text-white hover:bg-[#222]">
              <LanguageFlag language="en" small />
              <span>English</span>
            </button>
          ) : (
            <button type="button" role="menuitem" onClick={() => chooseLanguage("vi")} className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm text-white hover:bg-[#222]">
              <LanguageFlag language="vi" small />
              <span>Vietnamese</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <header className="w-full">
      {/* =================================================
          BANNER HEADER
          ================================================= */}

      <div className="relative aspect-[5.3/1] w-full overflow-hidden bg-[#333]">
        {/* Ảnh nền */}
        <img
          src={`${import.meta.env.BASE_URL}images/A509 Header.jpg`}
          alt="A509 Research & Reenactment Group"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-[center_43%]
          "
        />

        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Logo */}
        <Link
          to="/"
          className="
            absolute
            left-6
            top-1/2
            z-10
            -translate-y-1/2
          "
        >
          <img
            src={`${import.meta.env.BASE_URL}images/A509 Header.jpg`}
            alt="A509 Research & Reenactment Group"
            className="
              h-auto
              w-[360px]
              object-contain
              transition-transform
              duration-200
              hover:scale-[1.02]
              md:w-[500px]
              lg:w-[560px]
            "
          />
        </Link>
      </div>

      {/* =================================================
          NAVIGATION
          ================================================= */}

      <nav className="border-b-[3px] border-[#9A1B1E] bg-[#292929]">
        {/* -------------------------------------------------
            DESKTOP NAVIGATION
            ------------------------------------------------- */}
        <div className="relative hidden min-h-[48px] w-full items-stretch justify-between pl-0 pr-6 md:flex">
          {/* Menu chính */}
          {navLinks.map((item) =>
            item.hasDropdown ? (
              <div
                key={item.to}
                className="
                  group
                  relative
                  flex-none
                "
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `
                    flex
                    h-full
                    items-center
                    justify-center
                    px-3
                    font-sans
                    text-[16px]
                    font-semibold
                    tracking-[0.01em]
                    whitespace-nowrap
                    text-white
                    transition-colors
                    hover:bg-[#444]
                    hover:text-[#f5c400]
                    ${
                      isActive
                        ? "bg-[#444] text-[#f5c400]"
                        : ""
                    }
                    `
                  }
                >
                  <span>{language === "en" ? englishNavLabels[item.to] : item.label}</span>

                </NavLink>

                {/* -------------------------------------------------
                    DROPDOWN
                    ------------------------------------------------- */}

                <div
                  className="
                    invisible
                    absolute
                    left-0
                    top-full
                    z-50
                    w-[230px]
                    pt-1
                    opacity-0
                    transition-all
                    duration-150

                    group-hover:visible
                    group-hover:opacity-100
                  "
                >
                  <div
                    className="
                      overflow-hidden
                      border
                      border-[#444]
                      bg-[#292929]
                      shadow-xl
                    "
                  >
                    {item.dropdownItems?.map((dropdownItem) => (
                      <NavLink
                        key={dropdownItem.to}
                        to={dropdownItem.to}
                        end
                        className={({ isActive }) =>
                          `
                          flex
                          items-center
                          gap-2
                          px-4
                          py-3
                          text-[14px]
                          text-white
                          transition-colors
                          hover:bg-[#444]

                          ${
                            isActive
                              ? "font-bold"
                              : ""
                          }
                          `
                        }
                      >
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-white"
                        />

                        <span>{language === "en" ? englishDropdownLabels[dropdownItem.to] : dropdownItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  justify-center
                  ${item.to === "/gioi-thieu" || item.to === "/lien-he" ? "min-w-[112px] px-4" : "px-3"}
                  font-sans
                  text-[16px]
                  font-semibold
                  tracking-[0.02em]
                  whitespace-nowrap
                  text-white
                  transition-colors
                  hover:bg-[#444]
                  hover:text-[#f5c400]
                  ${
                    isActive
                      ? "bg-[#444] text-[#f5c400]"
                      : ""
                  }
                  `
                }
              >
                {language === "en" ? englishNavLabels[item.to] : item.label}
              </NavLink>
            )
          )}

          {/* =================================================
              NÚT NGÔN NGỮ
              Chỉ giao diện - chưa xử lý chức năng dịch
              ================================================= */}

          <LanguageSelector />
        </div>

        {/* =================================================
            MOBILE MENU BUTTON
            ================================================= */}

        <div className="px-3 md:hidden">
          <button
            type="button"
            className="
              flex
              h-[48px]
              w-full
              items-center
              justify-between
              text-white
            "
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-sm font-bold tracking-wide">
              MENU
            </span>

            <span className="text-xl leading-none">
              {isMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>

        {/* =================================================
            MOBILE MENU
            ================================================= */}

        {isMenuOpen && (
          <div
            className="
              border-t
              border-white/10
              bg-[#292929]
              px-3
              pb-3
              md:hidden
            "
          >
            {navLinks.map((item) =>
              item.hasDropdown ? (
                <div
                  key={item.to}
                  className="border-b border-white/10"
                >
                  {/* Menu chính */}
                  <Link
                    to={item.to}
                    className="
                      block
                      py-3
                      text-sm
                      font-bold
                      text-white
                      hover:text-[#f5c400]
                    "
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {language === "en" ? englishNavLabels[item.to] : item.label}
                  </Link>

                  {/* Sub menu */}
                  <div className="pb-2 pl-4">
                    {item.dropdownItems?.map(
                      (dropdownItem) => (
                        <Link
                          key={dropdownItem.to}
                          to={dropdownItem.to}
                          className="
                            flex
                            items-center
                            gap-2
                            py-1.5
                            text-xs
                            text-white/70
                            transition-colors
                            hover:text-[#f5c400]
                          "
                          onClick={() =>
                            setIsMenuOpen(false)
                          }
                        >
                          <ChevronRight size={12} />

                          {language === "en" ? englishDropdownLabels[dropdownItem.to] : dropdownItem.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="
                    block
                    border-b
                    border-white/10
                    py-3
                    text-sm
                    font-bold
                    text-white
                    hover:text-[#f5c400]
                  "
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === "en" ? englishNavLabels[item.to] : item.label}
                </Link>
              )
            )}

            {/* -------------------------------------------------
                NGÔN NGỮ MOBILE
                ------------------------------------------------- */}

            <LanguageSelector mobile />
          </div>
        )}
      </nav>

    </header>
  );
}
