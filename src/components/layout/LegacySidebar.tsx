import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import SearchForm from "@/components/SearchForm";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { articleApi } from "@/api/articleApi";
import axiosClient from "@/api/axiosClient";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityLog, ArticleDTO } from "@/types/models";
import Profile from "@/components/auth/Profile";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LegacySidebar() {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [latest, setLatest] = useState<ArticleDTO[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    Promise.all([
      articleApi.getLatest(),
      axiosClient.get<ActivityLog[]>("/api/activity"),
    ])
      .then(([articles, activityResponse]) => {
        setLatest(articles);
        setActivities(activityResponse.data);
      })
      .catch(() => undefined);
  }, []);

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError(uiText("Vui lòng nhập tên đăng nhập và mật khẩu."));
      return;
    }
    try {
      const result = await authApi.login(username.trim(), password);
      authApi.saveToken(result.token, result.userInfo);
      login(result.token, result.userInfo);
      setPassword("");
      setError("");
    } catch {
      setError(uiText("Tên đăng nhập hoặc mật khẩu không đúng."));
    }
  };

  return (
    <aside className="min-w-0">
      <div className="mb-5">
        <SearchForm />
      </div>
      <div className="mb-5 bg-[#f1f1f1] p-3">
        {!isAuthenticated && (
          <h2 className="mb-3 font-display text-[16px] font-black uppercase text-[#333]">
            {uiText("Đăng nhập")}
          </h2>
        )}
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              title={uiText("Chỉnh sửa ảnh đại diện")}
              className="flex min-w-0 items-center gap-2 text-left hover:text-[#b51f24]"
            >
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#b51f24] bg-white text-center leading-9 font-bold text-[#b51f24]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={uiText("Ảnh đại diện")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user.fullName || user.username).charAt(0).toUpperCase()
                )}
              </span>
              <span className="truncate font-bold">
                {user.fullName || user.username}
              </span>
            </button>
            <button
              onClick={logout}
              type="button"
              className="shrink-0 text-[#d32f2f] hover:underline"
            >
              {uiText("Đăng xuất")}
            </button>
          </div>
        ) : (
          <form onSubmit={submitLogin}>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={uiText("Tên đăng nhập")}
              className="mb-2 h-9 w-full border border-[#ccc] bg-white px-2 text-sm outline-none"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder={uiText("Mật khẩu")}
              className="h-9 w-full border border-[#ccc] bg-white px-2 text-sm outline-none"
            />
            {error && (
              <p className="mt-1 text-[11px] text-[#c62828]">{error}</p>
            )}
            <div className="mt-2 flex justify-end gap-3 text-[13px]">
              <button type="submit" className="text-[#d32f2f] hover:underline">
                {uiText("Đăng nhập")}
              </button>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openRegisterModal"))
                }
                className="text-[#d32f2f] hover:underline"
              >
                {uiText("Đăng ký")}
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openForgotPasswordModal"))
              }
              className="mt-1 block ml-auto text-[12px] text-[#777] hover:text-[#c62828] hover:underline"
            >
              {uiText("Quên mật khẩu?")}
            </button>
          </form>
        )}
      </div>
      <SidebarList
        title={language === "en" ? "LATEST ARTICLES" : uiText("BÀI VIẾT MỚI")}
        items={latest.map((article) => ({
          label:
            language === "en"
              ? article.titleEn || article.title
              : article.title,
          to: `/tin-tuc/${article.slug}`,
        }))}
      />
      <SidebarList
        title={uiText("CẬP NHẬT")}
        items={activities.map((activity) => ({
          label: activity.description || activity.action,
          to: activity.articleSlug ? `/tin-tuc/${activity.articleSlug}` : "#",
        }))}
      />
      {showProfile && user && (
        <Profile
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdateSuccess={(updatedUser) => {
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (token) {
              authApi.saveToken(token, updatedUser);
              login(token, updatedUser);
            }
          }}
        />
      )}
    </aside>
  );
}

function SidebarList({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: string }[];
}) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  return (
    <div className="mb-5 bg-[#f1f1f1] p-3">
      <h2 className="mb-3 font-display text-[16px] font-black uppercase text-[#333]">
        {title}
      </h2>
      <ul className="space-y-2 text-[13px] leading-[1.2]">
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <li
              key={`${item.to}-${index}`}
              className="relative pl-3 before:absolute before:left-0 before:content-['•']"
            >
              <Link to={item.to} className="hover:text-[#b51f24]">
                {item.label}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-[#999]">{uiText("Chưa có dữ liệu.")}</li>
        )}
      </ul>
    </div>
  );
}
