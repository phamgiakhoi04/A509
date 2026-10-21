import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { articleApi } from "@/api/articleApi";
import type { ArticleDTO } from "@/types/models";
import { formatDateTime } from "@/utils/format";
import LegacySidebar from "@/components/layout/LegacySidebar";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleText } from "@/utils/articleTranslation";

const sections = [
  ["/tai-lieu/quan-trang", "Quân trang"],
  ["/tai-lieu/anh-tu-lieu", "Ảnh tư liệu"],
  ["/tai-lieu/hoi-uc-ccb", "Hồi ức CCB"],
  ["/tai-lieu/thu-vien", "Thư viện"],
  ["/tai-lieu/nghien-cuu", "Từ điển"],
];
const categorySlugs = ["anh-tu-lieu", "hoi-uc-ccb", "thu-vien", "nghien-cuu"];
const englishSectionLabels: Record<string, string> = {
  "/tai-lieu/quan-trang": "Uniforms",
  "/tai-lieu/anh-tu-lieu": "Archive photos",
  "/tai-lieu/hoi-uc-ccb": "Veterans’ memoirs",
  "/tai-lieu/thu-vien": "Library",
  "/tai-lieu/nghien-cuu": "Reference",
};

export default function DocumentPage() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(categorySlugs.map((slug) => articleApi.getByCategory(slug)))
      .then((groups) => {
        const unique = new Map<number, ArticleDTO>();
        groups.flat().forEach((article) => { if (article.id) unique.set(article.id, article); });
        setArticles(Array.from(unique.values()));
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return <ContentPageLayout sidebar={<LegacySidebar />}>
    <section className="min-w-0">
      <div className="mb-7 bg-[#f1f1f1] px-3 py-2 text-[16px] text-[#444]">{language === "en" ? "Resources" : "Tài liệu"}</div>
      <ContentPageTitle className="border-[#b51f24] text-[#9f2922]">{language === "en" ? "Resources" : "Tài liệu"}</ContentPageTitle>
      <nav className="mb-7 flex flex-wrap gap-2">{sections.map(([to, label]) => <Link key={to} to={to} className="border border-[#ccc] px-3 py-2 text-sm hover:border-[#b51f24] hover:text-[#b51f24]">{language === "en" ? englishSectionLabels[to] || label : label}</Link>)}</nav>
      {loading ? <p className="py-16 text-center text-[#777]">{language === "en" ? "Loading resources..." : "Đang tải dữ liệu..."}</p> : articles.length === 0 ? <p className="py-16 text-center text-[#777]">{language === "en" ? "No resources have been published yet." : "Chưa có tài liệu được đăng."}</p> : <div className="space-y-6">{articles.map((article) => { const localized = getLocalizedArticleText(article, language); return <Link key={article.id} to={`/tin-tuc/${article.slug}`} className="group grid gap-4 border-b border-[#ddd] pb-6 md:grid-cols-[220px_1fr]">
        {article.thumbnailUrl ? <img src={article.thumbnailUrl} alt={localized.title} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-[#f1f1f1] text-5xl text-[#ccc]">▧</div>}
        <div><h2 className="font-display text-xl font-black uppercase leading-tight group-hover:text-[#b51f24]">{localized.title}</h2><p className="mt-1 text-sm italic text-[#888]">{article.publishedAt ? formatDateTime(article.publishedAt) : ""}</p><p className="mt-2 line-clamp-3 text-[#555]">{localized.excerpt || (language === "en" ? "Content is being prepared..." : "Nội dung đang được cập nhật...")}</p></div>
      </Link>; })}</div>}
    </section>
  </ContentPageLayout>;
}
