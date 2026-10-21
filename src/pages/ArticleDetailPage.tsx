import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { articleApi } from "@/api/articleApi";
import { useAuth } from "@/contexts/AuthContext";
import type { ArticleDTO } from "@/types/models";
import { formatDateTime } from "@/utils/format";
import CommentSection from "@/components/CommentSection";
import SensitiveImage from "@/components/SensitiveImage";
import LegacySidebar from "@/components/layout/LegacySidebar";
import ContentPageLayout from "@/components/layout/ContentPageLayout";
import type { ArticleImage } from "@/api/articleApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedArticleText } from "@/utils/articleTranslation";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [article, setArticle] = useState<ArticleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ArticleImage[]>([]);

  useEffect(() => {
    if (!slug) return;
    articleApi.getBySlug(slug)
      .then(async (data) => {
        setArticle(data);
        if (data.id) setImages(await articleApi.getImages(data.id).catch(() => []));
      })
      .catch(() => setError("Không tìm thấy bài viết hoặc bài viết chưa được xuất bản."))
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated]);

  if (loading) return <ContentPageLayout className="min-h-[55vh] py-20 text-center text-gray-500">Đang tải bài viết...</ContentPageLayout>;
  if (error || !article) return <ContentPageLayout className="min-h-[55vh] py-20 text-center"><p className="text-brand-red">{error || "Không tìm thấy bài viết."}</p><Link className="mt-4 inline-block text-brand-red underline" to="/">Về trang chủ</Link></ContentPageLayout>;

  const localized = getLocalizedArticleText(article, language);

  return (
    <ContentPageLayout sidebar={<LegacySidebar />}>
      <article className="min-w-0">
        <div className="bg-[#f1f1f1] px-3 py-2 text-sm text-gray-700">{language === "en" ? "News" : "Tin tức"}&nbsp; / &nbsp;{language === "en" ? "Article" : "Bài viết"}</div>
        <Link to="/" className="mt-5 inline-block text-sm font-bold text-brand-red hover:underline">← {language === "en" ? "Home" : "Về trang chủ"}</Link>
        <h1 className="mt-4 font-display text-2xl font-black leading-[1.12] text-black md:text-3xl">{localized.title}</h1>
        <p className="mt-3 text-base italic text-gray-500">{article.authorName || "A509"} {article.publishedAt && `| ${formatDateTime(article.publishedAt)}`}</p>
        {localized.excerpt && <p className="mt-5 text-lg font-bold leading-relaxed text-gray-700">{localized.excerpt}</p>}
        {(article.thumbnailUrl || article.thumbnailSensitive) && <SensitiveImage src={article.thumbnailUrl || undefined} sensitive={Boolean(article.thumbnailSensitive)} alt={localized.title} className="mt-6 max-h-[520px] w-full object-cover" />}
        <div className="mt-6 whitespace-pre-wrap text-[17px] leading-relaxed text-gray-800">{localized.content}</div>
        {images.map((image) => <figure key={image.id} className="mt-6"><SensitiveImage src={image.imageUrl || undefined} sensitive={Boolean(image.sensitive)} alt={image.description || article.title} className="w-full" />{image.description && <figcaption className="bg-gray-100 px-3 py-2 text-center text-sm text-gray-600">{image.description}</figcaption>}</figure>)}
        <div className="mt-8 flex justify-end gap-2 text-sm font-bold text-gray-700">Chia sẻ: <span className="text-blue-600">●</span><span>✕</span><span className="text-red-700">●</span></div>
        {article.id && <div className="mt-8"><CommentSection articleId={article.id} variant="legacy" /></div>}
      </article>
    </ContentPageLayout>
  );
}
