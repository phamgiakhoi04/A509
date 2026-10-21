import type { Language } from "@/contexts/LanguageContext";

type ArticleText = {
  title: string;
  excerpt?: string;
  content?: string;
  titleEn?: string;
  excerptEn?: string;
  contentEn?: string;
};

export function getLocalizedArticleText(article: ArticleText, language: Language) {
  if (language !== "en") {
    return { title: article.title, excerpt: article.excerpt, content: article.content };
  }

  return {
    title: article.titleEn || article.title,
    excerpt: article.excerptEn || article.excerpt,
    content: article.contentEn || article.content,
  };
}
