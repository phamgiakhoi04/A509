import axiosClient from "./axiosClient";

export type ContactRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const contactApi = {
  send: async (payload: ContactRequest) => {
    const response = await axiosClient.post<{ message: string }>("/api/contact", payload, { timeout: 30000 });
    return response.data;
  },
};
