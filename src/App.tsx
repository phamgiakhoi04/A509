import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import UniformPage from "@/pages/UniformPage";
import UniformDetailPage from "@/pages/UniformDetailPage";
import ReenactmentPage from "@/pages/ReenactmentPage";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import UniformManager from "@/pages/admin/UniformManager";
import ReenactmentManager from "@/pages/admin/ReenactmentManager";
import EditUniform from "./pages/admin/edit/EditUniform";
import EditReenactment from "./pages/admin/edit/EditReenactment";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import ArticleListPage from "@/pages/ArticleListPage";
import NewsManager from "@/pages/admin/NewsManager";
import DocumentManager from "@/pages/admin/DocumentManager";
import EditArticle from "@/pages/admin/edit/EditArticle";
import SearchPage from "@/pages/SearchPage";
import DocumentLandingPage from "@/pages/DocumentPage";
import UserManager from "@/pages/admin/UserManager";
import ReenactmentHierarchyPage from "@/pages/ReenactmentHierarchyPage";
import ImageContextNotice from "@/components/ImageContextNotice";
import PageViewTracker from "@/components/PageViewTracker";
import OverviewPage from "@/pages/admin/OverviewPage";
import TranslationManager from "@/pages/admin/TranslationManager";
import { useLanguage } from "@/contexts/LanguageContext";

export default function App() {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const { language } = useLanguage();
  return (
    <>
      <ImageContextNotice />
      <PageViewTracker />
      <Routes key={language}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/phuc-dung">
            <Route index element={<ReenactmentPage />} />
            <Route path=":countrySlug" element={<ReenactmentHierarchyPage />} />
            <Route
              path=":countrySlug/:unitSlug"
              element={<ReenactmentHierarchyPage />}
            />
            <Route
              path=":countrySlug/:unitSlug/:periodSlug"
              element={<ReenactmentHierarchyPage />}
            />
          </Route>

          <Route
            path="/hoat-dong"
            element={
              <ArticleListPage
                categorySlug="phuc-dung"
                title={uiText("Hoạt động")}
              />
            }
          />
          <Route
            path="/hoat-dong/nghien-cuu"
            element={
              <ArticleListPage
                categorySlug="nghien-cuu"
                title={uiText("Nghiên cứu")}
              />
            }
          />
          <Route path="/hoat-dong/phuc-dung" element={<ReenactmentPage />} />
          <Route
            path="/hoat-dong/phuc-dung/:countrySlug"
            element={<ReenactmentHierarchyPage />}
          />
          <Route
            path="/hoat-dong/phuc-dung/:countrySlug/:unitSlug"
            element={<ReenactmentHierarchyPage />}
          />
          <Route
            path="/hoat-dong/phuc-dung/:countrySlug/:unitSlug/:periodSlug"
            element={<ReenactmentHierarchyPage />}
          />

          <Route
            path="/kham-pha/tim-hieu"
            element={
              <ArticleListPage
                categorySlug="tim-hieu"
                title={uiText("Tìm hiểu")}
              />
            }
          />
          <Route
            path="/kham-pha"
            element={
              <ArticleListPage
                categorySlug="kham-pha"
                title={uiText("Khám phá")}
              />
            }
          />
          <Route
            path="/kham-pha/diy"
            element={<ArticleListPage categorySlug="diy" title="DIY" />}
          />
          <Route
            path="/kham-pha/cac-van-de"
            element={
              <ArticleListPage
                categorySlug="cac-van-de"
                title={uiText("Các vấn đề")}
              />
            }
          />
          <Route
            path="/van-hoa/trong-nuoc"
            element={
              <ArticleListPage
                categorySlug="trong-nuoc"
                title={uiText("Trong nước")}
              />
            }
          />
          <Route
            path="/van-hoa/ngoai-nuoc"
            element={
              <ArticleListPage
                categorySlug="ngoai-nuoc"
                title={uiText("Ngoài nước")}
              />
            }
          />
          <Route
            path="/van-hoa"
            element={
              <ArticleListPage
                categorySlug="van-hoa"
                title={uiText("Văn hóa")}
              />
            }
          />

          <Route path="/quan-trang">
            <Route index element={<UniformPage />} />
            <Route path="trang-bi/:id" element={<UniformDetailPage />} />
          </Route>

          <Route path="/tin-tuc" element={<ArticleListPage />} />
          <Route
            path="/tin-tuc/thoi-su"
            element={
              <ArticleListPage
                categorySlug="thoi-su"
                title={uiText("Thời sự")}
              />
            }
          />
          <Route
            path="/tin-tuc/phong-su"
            element={
              <ArticleListPage
                categorySlug="phong-su"
                title={uiText("Phóng sự")}
              />
            }
          />
          <Route
            path="/tin-tuc/chia-se-kinh-nghiem"
            element={<Navigate to="/tin-tuc/phong-su" replace />}
          />
          <Route
            path="/tin-tuc/goc-nhin"
            element={<Navigate to="/tai-lieu/hoi-uc-ccb" replace />}
          />
          <Route
            path="/tin-tuc/nuoc-ngoai"
            element={<Navigate to="/tai-lieu/thu-vien" replace />}
          />
          <Route path="/tin-tuc/:slug" element={<ArticleDetailPage />} />

          <Route path="/tai-lieu">
            <Route index element={<DocumentLandingPage />} />
            <Route
              path="anh-tu-lieu"
              element={
                <ArticleListPage
                  categorySlug="anh-tu-lieu"
                  title={uiText("Ảnh tư liệu")}
                />
              }
            />
            <Route
              path="hoi-uc-ccb"
              element={
                <ArticleListPage
                  categorySlug="hoi-uc-ccb"
                  title={uiText("Hồi ức CCB")}
                />
              }
            />
            <Route
              path="thu-vien"
              element={
                <ArticleListPage
                  categorySlug="thu-vien"
                  title={uiText("Thư viện")}
                />
              }
            />
            <Route
              path="chia-se-kinh-nghiem"
              element={<Navigate to="/tai-lieu/anh-tu-lieu" replace />}
            />
            <Route
              path="goc-nhin"
              element={<Navigate to="/tai-lieu/hoi-uc-ccb" replace />}
            />
            <Route
              path="nuoc-ngoai"
              element={<Navigate to="/tai-lieu/thu-vien" replace />}
            />
            <Route path="quan-trang">
              <Route index element={<UniformPage />} />
              <Route path=":id" element={<UniformDetailPage />} />
            </Route>
            <Route
              path="nghien-cuu"
              element={<Navigate to="/tai-lieu/tu-dien" replace />}
            />
            <Route
              path="tu-dien"
              element={
                <ArticleListPage
                  categorySlug="tu-dien"
                  title={uiText("Từ điển")}
                />
              }
            />
            <Route
              path=":slug"
              element={
                <div className="min-h-screen bg-brand-bg pt-24 pb-12">
                  <div className="container-page">
                    <h1 className="font-display font-black text-3xl text-brand-red">
                      {uiText("Chi tiết Tài liệu")}
                    </h1>
                    <p className="mt-4 text-brand-text/70">
                      {uiText("Nội dung đang được cập nhật...")}
                    </p>
                  </div>
                </div>
              }
            />
          </Route>

          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/reset-password" element={<HomePage />} />

          <Route
            path="*"
            element={
              <div className="min-h-screen bg-white flex items-center justify-center text-3xl font-bold text-gray-400">
                {uiText("404 - Không tìm thấy")}
              </div>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<OverviewPage />} />
            <Route path="quan-trang" element={<UniformManager />} />
            <Route path="phuc-dung" element={<ReenactmentManager />} />
            <Route path="tin-tuc" element={<NewsManager />} />
            <Route path="tin-tuc/edit/:id" element={<EditArticle />} />
            <Route path="tai-lieu" element={<DocumentManager />} />
            <Route
              path="tai-lieu/edit/:id"
              element={<EditArticle section="documents" />}
            />
            <Route path="users" element={<UserManager />} />
            <Route path="ban-dich" element={<TranslationManager />} />
            <Route path="quan-trang/edit/:id" element={<EditUniform />} />
            <Route
              path="phuc-dung/noi-dung/edit/:id"
              element={
                <EditUniform
                  categoryType="REENACTMENT"
                  redirectPath="/admin/phuc-dung"
                />
              }
            />
            <Route path="phuc-dung/edit/:id" element={<EditReenactment />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
