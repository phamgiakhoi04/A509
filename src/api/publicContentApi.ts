import axiosClient from "./axiosClient";

export const publicContentApi = {
  getCountries: async () => (await axiosClient.get("/api/countries")).data,
  getReenactmentRoots: async () => (await axiosClient.get("/api/uniform-categories/roots/REENACTMENT")).data,
  getShowcase: async (countryId: number, categoryId: number, periodCategoryId: number) =>
    (await axiosClient.get("/api/uniforms/reenactment", { params: { countryId, categoryId, periodCategoryId } })).data,
};
