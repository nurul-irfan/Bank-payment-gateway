import api from "@/service/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
  };
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<LoginResponse>("/admin/auth/login", data),
};
