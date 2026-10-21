import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { repo } from "@/api/repository";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/contexts/AuthContext";
import Profile from "@/components/auth/Profile";
import SensitiveImage from "@/components/SensitiveImage";
import type { Article, ActivityLog } from "@/types/models";
import { formatDateTime } from "@/utils/format";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleText } from "@/utils/articleTranslation";

export default function TrangChu() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [restorationArticles, setRestorationArticles] = useState<Article[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { isAuthenticated, user, login, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const handleSidebarLogin = async (event: FormEvent) => {
    event.preventDefault();

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await authApi.login(
        loginUsername.trim(),
        loginPassword
      );

      authApi.saveToken(result.token, result.userInfo);
      login(result.token, result.userInfo);

      setLoginPassword("");
    } catch {
      setLoginError("Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const loadHomepage = async () => {
      try {
        const [
          featuredData,
          latestData,
          restorationData,
          activityData,
        ] = await Promise.all([
          repo.getFeaturedArticles(),
          repo.getLatestArticles(),
          repo.getArticlesByCategory("phuc-dung"),
          repo.getActivities(),
        ]);

        setFeaturedArticles(featuredData || []);
        setLatestArticles(latestData || []);
        setRestorationArticles(restorationData || []);
        setActivities(activityData || []);
      } catch (error) {
        console.error("Không thể tải dữ liệu Homepage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHomepage();
  }, [isAuthenticated]);

  const getArticleImage = (article: Article) => {
    return (
      article.thumbnailUrl ||
      `${import.meta.env.BASE_URL}images/A509 Header.JPG`
    );
  };

  const getArticleLink = (article: Article) => {
    return `/tin-tuc/${article.slug}`;
  };

  const filteredFeaturedArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return featuredArticles;
    }

    return featuredArticles.filter((article) =>
      `${article.title} ${article.excerpt || ""} ${article.content || ""} ${
        article.titleEn || ""
      } ${article.excerptEn || ""} ${article.contentEn || ""
      }`
        .toLowerCase()
        .includes(query)
    );
  }, [featuredArticles, searchQuery]);

  const filteredRestorationArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return restorationArticles;
    }

    return restorationArticles.filter((article) =>
      `${article.title} ${article.excerpt || ""} ${article.content || ""} ${
        article.titleEn || ""
      } ${article.excerptEn || ""} ${article.contentEn || ""
      }`
        .toLowerCase()
        .includes(query)
    );
  }, [restorationArticles, searchQuery]);

  const featuredArticle = filteredFeaturedArticles[0];

  const smallArticles = filteredFeaturedArticles.slice(1, 4);

  const latestArticleList = latestArticles.slice(0, 4);

  return (
    <div className="homepage font-body bg-brand-bg text-brand-text">
      <main className="mx-auto w-full max-w-[900px] bg-white">
        <div className="px-5 py-4 md:px-10 md:py-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
            {/* ===================================================
                CỘT TRÁI
               =================================================== */}

            <section className="min-w-0">
              {/* ================= TIN NỔI BẬT ================= */}

              <div className="mb-3 flex items-center gap-2 border-b border-[#ddd] pb-2">
                <span className="text-[20px] text-[#9A1B1E]">★</span>

                <h1 className="font-display text-[22px] font-black uppercase text-[#9A1B1E]">
                  Tin nổi bật
                </h1>
              </div>

              {loading ? (
                <div className="py-16 text-center text-sm text-gray-500">
                  Đang tải dữ liệu...
                </div>
              ) : featuredArticle ? (
                <>
                  {/* ================= BÀI LỚN ================= */}

                  <Link
                    to={getArticleLink(featuredArticle)}
                    className="group block"
                  >
                    <div className="aspect-[16/9] w-[calc(100%_-_0.5cm)] overflow-hidden bg-[#eee]">
                      <SensitiveImage
                        src={getArticleImage(featuredArticle)}
                        sensitive={Boolean(featuredArticle.thumbnailSensitive)}
                        alt={featuredArticle.title}
                        className="h-full w-[calc(100%+1cm)] max-w-none -translate-x-[1cm] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <h2 className="mt-3 text-left font-display text-[20px] font-black uppercase leading-[1.18] tracking-[0.01em] text-black transition-colors group-hover:text-[#9A1B1E] md:text-[22px]">
                      {featuredArticle.title}
                    </h2>
                  </Link>

                  {/* ================= 3 BÀI NHỎ ================= */}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {smallArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={getArticleLink(article)}
                        className="group block"
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-[#eee]">
                          <SensitiveImage
                            src={getArticleImage(article)}
                            sensitive={Boolean(article.thumbnailSensitive)}
                            alt={getLocalizedArticleText(article, language).title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <h3 className="mt-2 font-display text-[14px] font-bold leading-[1.12] text-[#222] group-hover:text-[#9A1B1E]">
                          {getLocalizedArticleText(article, language).title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  Chưa có bài viết nổi bật.
                </div>
              )}

              {/* =================================================
                  PHỤC DỰNG TRANG PHỤC
                 ================================================= */}

              <div className="mt-4">
                <div className="border-b-0 bg-[#f1f1f1] px-3 py-2">
                  <h2 className="font-display text-[19px] font-black uppercase text-[#9A1B1E]">
                    Phục dựng trang phục
                  </h2>
                </div>

                <div className="mt-4">
                  {filteredRestorationArticles.length > 0 ? (
                    filteredRestorationArticles
                      .slice(0, 6)
                      .map((article) => (
                        <Link
                          key={article.id}
                          to={getArticleLink(article)}
                          className="group mb-5 grid grid-cols-[155px_minmax(0,1fr)] gap-4 border-b border-[#e5e5e5] pb-5 last:border-b-0"
                        >
                          {/* Ảnh */}

                          <div className="aspect-[4/3] overflow-hidden bg-[#eee]">
                            <SensitiveImage
                              src={getArticleImage(article)}
                              sensitive={Boolean(article.thumbnailSensitive)}
                              alt={getLocalizedArticleText(article, language).title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          {/* Nội dung */}

                          <div>
                            <h3 className="font-display text-[16px] font-black uppercase leading-[1.15] text-[#333] group-hover:text-[#9A1B1E]">
                              {getLocalizedArticleText(article, language).title}
                            </h3>

                            <div className="mt-1 font-mono text-[12px] italic text-[#999]">
                              A509 &nbsp;|&nbsp;{" "}
                              {formatDateTime(
                                article.createdAt || article.publishedAt || ""
                              )}
                            </div>

                            <p className="mt-2 line-clamp-3 text-[14px] leading-[1.25] text-[#444]">
                              {getLocalizedArticleText(article, language).excerpt ||
                                "Chưa có mô tả cho bài viết này."}
                            </p>
                          </div>
                        </Link>
                      ))
                  ) : (
                    <div className="py-8 text-center text-sm text-[#999]">
                      Chưa có bài viết phục dựng.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================
                CỘT PHẢI - SIDEBAR
               =================================================== */}

            <aside className="min-w-0">
              {/* ================= TÌM KIẾM ================= */}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate(searchQuery.trim() ? `/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}` : "/tim-kiem");
                }}
                className="mb-5 flex h-[30px]"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Tra cứu..."
                  className="min-w-0 flex-1 border border-[#ccc] px-2 text-[13px] italic outline-none focus:border-[#9A1B1E]"
                />

                <button
                  type="submit"
                  className="w-[38px] bg-[#9A1B1E] text-white transition hover:bg-[#741417]"
                >
                  &gt;
                </button>
              </form>

              {/* ================= ĐĂNG NHẬP ================= */}

              <div className="mb-4 bg-[#f1f1f1] p-3">
                {!isAuthenticated && (
                  <h2 className="mb-3 font-display text-[16px] font-black uppercase text-[#333]">
                    Đăng nhập
                  </h2>
                )}

                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between gap-3 text-[12px] text-[#333]">
                    <button
                      type="button"
                      onClick={() => setShowProfile(true)}
                      className="flex min-w-0 items-center gap-2 text-left hover:text-[#9A1B1E]"
                      title="Chỉnh sửa ảnh đại diện"
                    >
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#9A1B1E] bg-white text-center leading-9 text-[14px] font-bold text-[#9A1B1E]">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt="Ảnh đại diện"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          (
                            user.fullName ||
                            user.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </span>

                      <span className="max-w-[120px] truncate font-bold">
                        {user.fullName || user.username}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="shrink-0 text-[#9A1B1E] hover:underline"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSidebarLogin}>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(event) =>
                        setLoginUsername(event.target.value)
                      }
                      placeholder="Tên đăng nhập"
                      className="mb-2 h-[28px] w-full border border-[#ccc] bg-white px-2 outline-none"
                    />

                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) =>
                        setLoginPassword(event.target.value)
                      }
                      placeholder="Mật khẩu"
                      className="h-[28px] w-full border border-[#ccc] bg-white px-2 outline-none"
                    />

                    {loginError && (
                      <p className="mt-1 text-[11px] text-[#9A1B1E]">
                        {loginError}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="text-[12px] text-[#9A1B1E] hover:underline disabled:opacity-50"
                      >
                        {loginLoading
                          ? "Đang đăng nhập..."
                          : "Đăng nhập"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("openRegisterModal")
                          )
                        }
                        className="text-[12px] text-[#9A1B1E] hover:underline"
                      >
                        Đăng ký
                      </button>
                    </div>

                    <div className="mt-1 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent(
                              "openForgotPasswordModal"
                            )
                          )
                        }
                        className="text-[11px] text-[#777] hover:text-[#9A1B1E] hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* ================= BÀI VIẾT MỚI ================= */}

              <div className="mb-5 bg-[#f1f1f1] p-3">
                <h2 className="mb-2 font-display text-[16px] font-black uppercase text-[#333]">
                  Bài viết mới
                </h2>

                <ul className="list-disc space-y-1.5 pl-4">
                  {latestArticleList.map((article) => (
                    <li
                      key={article.id}
                      className="text-[13px] leading-[1.25]"
                    >
                      <span className="hidden">
                        •
                      </span>

                      <Link
                        to={getArticleLink(article)}
                        className="hover:text-[#9A1B1E]"
                      >
                        {getLocalizedArticleText(article, language).title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ================= CẬP NHẬT ================= */}

              <div className="bg-[#f1f1f1] p-3">
                <h2 className="mb-2 font-display text-[16px] font-black uppercase text-[#333]">
                  Cập nhật
                </h2>

                <ul className="list-disc space-y-2 pl-4 text-[13px] leading-[1.25]">
                  {activities.length > 0 ? (
                    activities.slice(0, 5).map((activity) => (
                      <li
                        key={activity.id}
                        className=""
                      >
                        <span className="hidden">•</span>

                        <Link
                          to={
                            activity.articleSlug
                              ? `/tin-tuc/${activity.articleSlug}`
                              : "#"
                          }
                          className="hover:text-[#9A1B1E]"
                        >
                          {activity.description ||
                            activity.action}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-[#999]">
                      Chưa có hoạt động mới.
                    </li>
                  )}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {showProfile && user && (
        <Profile
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdateSuccess={(updatedUser) => {
            const token = localStorage.getItem("ACCESS_TOKEN");

            if (token) {
              login(token, updatedUser);
            }
          }}
        />
      )}
    </div>
  );
}
