export type ContentSection = "news" | "documents" | "explore" | "culture" | "activities";
export type ClassifiedSection = ContentSection | "unclassified" | "mixed";
export type ContentCategory = { id: number; slug: string; name: string; parentId?: number | null };
export const sectionLabels: Record<ClassifiedSection, string> = {
  news: "Tin tức", documents: "Tài liệu", explore: "Khám phá", culture: "Văn hóa", activities: "Hoạt động",
  unclassified: "Chưa phân loại", mixed: "Cần phân loại lại",
};
const knownSections: Record<string, ContentSection> = {
  "tin-tuc": "news", "thoi-su": "news", "phong-su": "news",
  "tai-lieu": "documents", "quan-trang": "documents", "anh-tu-lieu": "documents", "hoi-uc-ccb": "documents", "thu-vien": "documents", "tu-dien": "documents",
  "kham-pha": "explore", "tim-hieu": "explore", "diy": "explore", "cac-van-de": "explore",
  "van-hoa": "culture", "trong-nuoc": "culture", "ngoai-nuoc": "culture",
  "phuc-dung": "activities", "hoat-dong": "activities", "nghien-cuu": "activities", "trang-phuc": "activities",
};
export const sectionRootSlugs: Record<ContentSection, string[]> = {
  news: ["tin-tuc"], documents: ["tai-lieu"], explore: ["kham-pha"], culture: ["van-hoa"], activities: ["hoat-dong", "phuc-dung"],
};

export function categorySection(category: ContentCategory, categories: ContentCategory[]): ContentSection | null {
  const seen = new Set<number>();
  let current: ContentCategory | undefined = category;
  let fallback: ContentSection | null = null;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    const section = knownSections[current.slug];
    if (section) fallback = section;
    current = current.parentId == null ? undefined : categories.find((item) => item.id === current!.parentId);
  }
  return fallback;
}

export function articleSection(article: { categoryIds?: number[] }, categories: ContentCategory[]): ClassifiedSection {
  const sections = new Set((article.categoryIds || []).map((id) => categories.find((category) => category.id === id))
    .filter((category): category is ContentCategory => Boolean(category))
    .map((category) => categorySection(category, categories)).filter((section): section is ContentSection => Boolean(section)));
  return sections.size > 1 ? "mixed" : sections.values().next().value || "unclassified";
}

export function categoriesForSection(section: ContentSection, categories: ContentCategory[]) {
  return categories.filter((category) => categorySection(category, categories) === section);
}

export function defaultCategoryIds(section: ContentSection, categories: ContentCategory[]): number[] {
  const root = categories.find((category) => sectionRootSlugs[section].includes(category.slug));
  return root ? [root.id] : [];
}
