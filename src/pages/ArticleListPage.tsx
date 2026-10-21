import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { articleApi } from "@/api/articleApi";
import type { ArticleDTO } from "@/types/models";
import { formatDateTime } from "@/utils/format";
import LegacySidebar from "@/components/layout/LegacySidebar";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleText } from "@/utils/articleTranslation";
import { useAuth } from "@/contexts/AuthContext";
import SensitiveImage from "@/components/SensitiveImage";

const labels: Record<string, string> = {
  "thoi-su": "Thời sự", "phong-su": "Phóng sự", "goc-nhin": "Góc nhìn",
  "nuoc-ngoai": "Nước ngoài", "chia-se-kinh-nghiem": "Chia sẻ kinh nghiệm",
};
const englishLabels: Record<string, string> = {
  "thoi-su": "Current Affairs",
  "phong-su": "Features",
  "goc-nhin": "Perspectives",
  "nuoc-ngoai": "International",
  "chia-se-kinh-nghiem": "Experience",
  "phuc-dung": "Activities",
  "nghien-cuu": "Research",
  "tim-hieu": "Learn",
  "kham-pha": "Explore",
  "diy": "DIY",
  "cac-van-de": "Topics",
  "trong-nuoc": "Domestic Culture",
  "ngoai-nuoc": "International Culture",
  "van-hoa": "Culture",
  "tin-tuc": "News",
};
// Route slugs mirror the `categories.slug` values from the backend.
// Keep this map only for legacy URLs that were previously exposed.
const apiSlugs: Record<string, string> = {};

export default function ArticleListPage({ categorySlug: fixedCategorySlug, title }: { categorySlug?: string; title?: string }) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { categorySlug: routeCategorySlug } = useParams<{ categorySlug: string }>();
  const categorySlug = fixedCategorySlug || routeCategorySlug || "tin-tuc";
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const request = categorySlug === "tin-tuc"
      ? articleApi.getLatest()
      : articleApi.getByCategory(apiSlugs[categorySlug] || categorySlug);
    request.then(setArticles).catch(() => setArticles([])).finally(() => setLoading(false));
  }, [categorySlug, isAuthenticated]);

  return (
    <ContentPageLayout sidebar={<LegacySidebar />}>
      <section className="min-w-0">
        <ContentPageTitle>{language === "en" ? englishLabels[categorySlug] || "News" : title || labels[categorySlug] || "Tin tức"}</ContentPageTitle>
        {loading ? <p className="py-16 text-center text-sm text-gray-500">{language === "en" ? "Loading..." : "Đang tải..."}</p> : articles.length === 0 ? <p className="py-16 text-center text-gray-500">{language === "en" ? "There are no articles in this section yet." : "Chưa có bài viết trong danh mục này."}</p> : <div className="mt-6 space-y-6">{articles.map((article) => { const localized = getLocalizedArticleText(article, language); return <Link key={article.id} to={`/tin-tuc/${article.slug}`} className="grid gap-4 border-b pb-6 md:grid-cols-[220px_1fr] hover:text-brand-red">{(article.thumbnailUrl || article.thumbnailSensitive) && <SensitiveImage src={article.thumbnailUrl || undefined} sensitive={Boolean(article.thumbnailSensitive)} alt={localized.title} className="aspect-[4/3] w-full object-cover" />}<div><h2 className="font-display text-xl font-black uppercase">{localized.title}</h2><p className="mt-1 text-sm italic text-gray-500">{article.publishedAt && formatDateTime(article.publishedAt)}</p><p className="mt-2 line-clamp-3 text-gray-700">{localized.excerpt}</p></div></Link>; })}</div>}
      </section>
    </ContentPageLayout>
  );
}
