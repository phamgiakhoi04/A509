import { adminApi } from "@/api/adminApi";
import { articleApi } from "@/api/articleApi";
import axiosClient from "@/api/axiosClient";
import type { Country, EquipmentItem, Post, Article, ArticleDTO, ActivityLog } from "@/types/models";

const createSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const mapUniformToEquipment = (uniform: any): EquipmentItem => ({
  id: uniform.id,
  slug: createSlug(uniform.name),
  name: uniform.name,
  description: uniform.description || "",
  excerpt: uniform.description || "",
  categorySlug: "trang-bi",
  images: uniform.images?.map((img: any) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    sensitive: Boolean(img.sensitive),
    caption: img.description || "",
  })) || [],
  country: uniform.country
    ? {
        id: uniform.country.id,
        slug: createSlug(uniform.country.countryName),
        name: uniform.country.countryName,
        countryName: uniform.country.countryName,
        continent: uniform.country.continent,
        flagImageUrl: uniform.country.flagImageUrl,
      }
    : null,
});

const mapArticle = (article: ArticleDTO): Article => ({
  ...article,
  // Published responses always have an id; the fallback only keeps the
  // shared response type safe for the create/update DTO shape.
  id: article.id ?? 0,
  categoryIds: article.categoryIds || [],
});

export const repo = {
  async getCountries(): Promise<Country[]> {
    try {
      const countries = await adminApi.getAllCountries();
      return countries.map((country: any) => ({
        id: country.id,
        slug: createSlug(country.countryName),
        name: country.countryName,
        countryName: country.countryName,  // ← THÊM dòng này
        continent: country.continent,
        flagImageUrl: country.flagImageUrl,
      }));
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách quốc gia:", error);
      return [];
    }
  },

  async getEquipmentItems(): Promise<EquipmentItem[]> {
    try {
      const rawData = await adminApi.getAllUniforms();
      const uniformList = Array.isArray(rawData) ? rawData : rawData.content || [];
      return uniformList.map(mapUniformToEquipment);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách quân trang:", error);
      return [];
    }
  },

  async getFeaturedArticles(): Promise<Article[]> {
  try {
    return (await articleApi.getFeatured()).map(mapArticle);
  } catch (error) {
    console.error("❌ Lỗi lấy bài nổi bật:", error);
    return [];
  }
},

async getLatestArticles(): Promise<Article[]> {
  try {
    return (await articleApi.getLatest()).map(mapArticle);
  } catch (error) {
    console.error("❌ Lỗi lấy bài viết mới:", error);
    return [];
  }
},

async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  try {
    return (await articleApi.getByCategory(categorySlug)).map(mapArticle);
  } catch (error) {
    console.error("❌ Lỗi lấy bài theo danh mục:", error);
    return [];
  }
},

async getActivities(): Promise<ActivityLog[]> {
  try {
    const { data } = await axiosClient.get<ActivityLog[]>("/api/activity");
    return data;
  } catch (error) {
    console.error("❌ Lỗi lấy cập nhật:", error);
    return [];
  }
},

  async getPosts(): Promise<Post[]> {
    return [];
  },
};
