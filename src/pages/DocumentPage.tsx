import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { articleApi } from "@/api/articleApi";
import type { ArticleDTO } from "@/types/models";
import { formatDateTime } from "@/utils/format";
import LegacySidebar from "@/components/layout/LegacySidebar";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleText } from "@/utils/articleTranslation";
import { articleSection } from "@/utils/contentSections";
import SensitiveImage from "@/components/SensitiveImage";
import { useAuth } from "@/contexts/AuthContext";

export default function DocumentPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([articleApi.getPublished(), articleApi.getCategories()])
      .then(([published, categories]) => setArticles(published.filter((article) => articleSection(article, categories) === "documents")))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return <ContentPageLayout sidebar={<LegacySidebar />}>
    <section className="min-w-0">
      <ContentPageTitle>{language === "en" ? "Resources" : "Tài liệu"}</ContentPageTitle>
      {loading ? <p className="py-16 text-center text-[#777]">{language === "en" ? "Loading resources..." : "Đang tải dữ liệu..."}</p> : articles.length === 0 ? <p className="py-16 text-center text-[#777]">{language === "en" ? "No resources have been published yet." : "Chưa có tài liệu được đăng."}</p> : <div className="space-y-6">{articles.map((article) => { const localized = getLocalizedArticleText(article, language); return <Link key={article.id} to={`/tin-tuc/${article.slug}`} className="group grid gap-4 border-b border-[#ddd] pb-6 md:grid-cols-[220px_1fr]">
        {article.thumbnailUrl || article.thumbnailSensitive ? <SensitiveImage src={article.thumbnailUrl || undefined} sensitive={Boolean(article.thumbnailSensitive)} alt={localized.title} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-[#f1f1f1] text-5xl text-[#ccc]">▧</div>}
        <div><h2 className="font-display text-xl font-black uppercase leading-tight group-hover:text-[#b51f24]">{localized.title}</h2><p className="mt-1 text-sm italic text-[#888]">{article.publishedAt ? formatDateTime(article.publishedAt) : ""}</p><p className="mt-2 line-clamp-3 text-[#555]">{localized.excerpt || (language === "en" ? "Content is being prepared..." : "Nội dung đang được cập nhật...")}</p></div>
      </Link>; })}</div>}
    </section>
  </ContentPageLayout>;
}
