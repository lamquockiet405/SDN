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
    const { confirmPassword, ...registerData } = data;
    const response = await api.post<AuthResponse>(
      "/auth/register",
      registerData,
    );
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

  getStoredUser(): User | null {
    return tokenUtils.getUser();
  },

  isAuthenticated(): boolean {
    return tokenUtils.isAuthenticated();
  },
};
