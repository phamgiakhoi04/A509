// src/api/authApi.ts
import axiosClient from "./axiosClient";
import type { AuthResponse, User } from "@/types/models";

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
  fullName: string;
};

export type UpdateProfileRequest = {
  avatarFile?: File | null;
};

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await axiosClient.post<AuthResponse>("/api/auth/login", { username, password });
    return res.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await axiosClient.post<User>("/api/auth/register", data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await axiosClient.post("/api/auth/forgot-password", { email: email.trim() });
    return res.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await axiosClient.post("/api/auth/reset-password", { token, newPassword });
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData();

    if (data.avatarFile) {
      formData.append("avatarFile", data.avatarFile);
    }

    const res = await axiosClient.post<User>("/api/users/profile", formData);
    return res.data;
  },

  saveToken: (token: string, userInfo: User) => {
    localStorage.setItem("ACCESS_TOKEN", token);
    localStorage.setItem("USER_INFO", JSON.stringify(userInfo));
  },

  getCurrentUser: (): User | null => {
    const str = localStorage.getItem("USER_INFO");
    try {
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER_INFO");
    window.location.reload();
  },
};
