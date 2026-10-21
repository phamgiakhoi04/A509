import axiosClient from "./axiosClient";
import type { ArticleDTO } from "@/types/models";

export type ArticleImage = {
  id: number;
  imageUrl: string | null;
  description?: string;
  sensitive?: boolean;
  referenceUniformId?: number | null;
  referenceUniformName?: string;
};

export const articleApi = {
  getImages: async (articleId: number): Promise<ArticleImage[]> => {
    const { data } = await axiosClient.get(`/api/articles/${articleId}/images`);
    return data;
  },
  getReferenceImages: async (uniformId: number): Promise<ArticleImage[]> => {
    const { data } = await axiosClient.get(`/api/articles/images/references`, { params: { uniformId } });
    return data;
  },
  uploadImage: async (
    articleId: number,
    file: File,
    sensitive = false,
    description = "",
    referenceUniformId?: number | null,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sensitive", String(sensitive));
    formData.append("description", description);
    if (referenceUniformId != null) formData.append("referenceUniformId", String(referenceUniformId));
    const { data } = await axiosClient.post(`/api/articles/${articleId}/images`, formData);
    return data;
  },
  deleteImage: async (imageId: number) => {
    await axiosClient.delete(`/api/articles/images/${imageId}`);
  },
  updateImageDescription: async (imageId: number, patch: { description?: string; sensitive?: boolean; referenceUniformId?: number | null } | string) => {
    const payload = typeof patch === "string" ? { description: patch } : patch;
    const { data } = await axiosClient.patch(`/api/articles/images/${imageId}`, payload);
    return data;
  },
  getCategories: async (): Promise<{ id: number; name: string; slug: string }[]> => {
    const { data } = await axiosClient.get("/api/categories");
    const rows = Array.isArray(data) ? data : data?.content;
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row: any) => ({
        id: Number(row.id ?? row.categoryId),
        name: String(row.name ?? row.categoryName ?? "").trim(),
        slug: String(row.slug ?? "").trim(),
      }))
      .filter((row) => Number.isFinite(row.id) && row.name);
  },

  getAllForAdmin: async (): Promise<ArticleDTO[]> => {
    const { data } = await axiosClient.get("/api/articles/admin");
    return data;
  },

  getLatest: async (): Promise<ArticleDTO[]> => {
    const { data } = await axiosClient.get("/api/articles/latest");
    return data;
  },

  getPublished: async (): Promise<ArticleDTO[]> => {
    const { data } = await axiosClient.get("/api/articles");
    return data;
  },

  getFeatured: async (): Promise<ArticleDTO[]> => {
    const { data } = await axiosClient.get("/api/articles/featured");
    return data;
  },

  getByCategory: async (categorySlug: string): Promise<ArticleDTO[]> => {
    const { data } = await axiosClient.get(
      `/api/articles/category/${categorySlug}`
    );
    return data;
  },

  getBySlug: async (slug: string): Promise<ArticleDTO> => {
    const { data } = await axiosClient.get(`/api/articles/${slug}`);
    return data;
  },

  create: async (article: ArticleDTO): Promise<ArticleDTO> => {
    const { data } = await axiosClient.post("/api/articles", article);
    return data;
  },

  update: async (id: number, article: ArticleDTO): Promise<ArticleDTO> => {
    const { data } = await axiosClient.put(`/api/articles/${id}`, article);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/articles/${id}`);
  },
};
