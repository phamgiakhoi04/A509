export type NavItem = { 
  to: string; 
  label: string; 
};

export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleName: string;
  status?: boolean;
  roles?: { name: string }[];
};

export type AuthResponse = {
  token: string;
  userInfo: User;
};

export type Country = {
  id: number;
  name: string;
  slug: string;
  countryName: string;
  continent?: string;
  flagImageUrl?: string;
};

export type EquipmentItem = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  excerpt?: string;
  history?: string;
  categorySlug: string;
  origin?: string;
  usedBy?: string;
  usedPeriod?: string;
  country: Country | null;
  images: {
    id: number;
    imageUrl?: string;
    sensitive?: boolean;
    caption?: string;
    description?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export type Uniform = {
  id: number;
  name: string;
  description?: string;
  history?: string;
  countryId?: number;
  country?: {
    id: number;
    countryName: string;
  };
  category?: {
    id: number;
    categoryName: string;
    categoryType?: string;
  };
  period?: string;
  periodCategory?: {
    id: number;
    categoryName: string;
    slug?: string;
  };
  images?: {
    id: number;
    imageUrl?: string;
    sensitive?: boolean;
    description?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export type CountryOption = {
  id: number;
  countryName: string;
};

export type Unit = { 
  slug: string; 
  countrySlug: string; 
  name: string; 
  description: string; 
};

export type PeriodArticle = {
  slug: string;
  countrySlug: string;
  unitSlug: string;
  title: string;
  periodLabel: string;
  excerpt: string;
  content: string;
  imageCaptions: any[];
  notes?: string;
  updatedAt: string;
};

export type EquipmentCategory = { 
  slug: string; 
  name: string; 
  description: string; 
};

export type PostType = "tai-lieu" | "tin-tuc";

export type Post = {
  id?: number;
  type: PostType;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
  coverCaption?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  coverImage?: string;
  image?: string;
  images?: { imageUrl?: string; url?: string }[];
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  titleEn?: string;
  excerptEn?: string;
  contentEn?: string;
  englishTranslationAvailable?: boolean;
  thumbnailUrl?: string;
  thumbnailSensitive?: boolean;

  status: "DRAFT" | "PUBLISHED" | string;

  featured: boolean;
  featuredOrder: number;

  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  authorId?: number;
  authorName?: string;

  categoryIds: number[];
};

export type ActivityLog = {
  id: number;
  action: string;
  description?: string;
  createdAt: string;

  articleId: number;
  articleSlug?: string;
  articleTitle: string;

  userId?: number;
  username?: string;
};

export type Comment = {
  id: number;
  content: string;
  uniformId?: number;
  articleId?: number;
  userId: number;
  username: string;
  userAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleDTO = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  titleEn?: string;
  excerptEn?: string;
  contentEn?: string;
  englishTranslationAvailable?: boolean;
  thumbnailUrl?: string;
  thumbnailSensitive?: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  featuredOrder: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  authorId?: number;
  authorName?: string;
  categoryIds: number[];
};
