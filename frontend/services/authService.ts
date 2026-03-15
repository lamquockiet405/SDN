import api from "@/lib/axios";
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/user";
import { tokenUtils } from "@/lib/token-utils";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens and user info
    tokenUtils.setTokens(accessToken, refreshToken);
    tokenUtils.setUser(user);

    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens and user info
    tokenUtils.setTokens(accessToken, refreshToken);
    tokenUtils.setUser(user);

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens regardless of API response
      tokenUtils.clearTokens();
      tokenUtils.clearUser();
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken, user } = response.data;

    // Update tokens and user info
    tokenUtils.setTokens(accessToken, newRefreshToken);
    tokenUtils.setUser(user);

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    const user = response.data;
    tokenUtils.setUser(user);
    return user;
  },

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async forgotPasswordOTP(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/auth/forgot-password-otp", { email });
    return response.data;
  },

  async verifyPasswordResetOTP(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/auth/verify-password-reset-otp", {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  getStoredUser(): User | null {
    return tokenUtils.getUser();
  },

  isAuthenticated(): boolean {
    return tokenUtils.isAuthenticated();
  },
};
