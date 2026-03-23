import api from "@/lib/axios";
import { User } from "@/types/user";

export interface PaginationResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalStaff: number;
  totalAdmins: number;
  activeViolations: number;
  totalViolations: number;
  inactiveUsers: number;
  lockedUsers: number;
}

export interface RolePermission {
  _id: string;
  role: "user" | "staff" | "admin";
  permissions: string[];
  updatedAt: string;
}

export interface ViolatedUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "staff" | "admin";
  status: "active" | "inactive" | "locked";
  violationCount: number;
  lastViolationAt: string;
  latestReason: string;
  severity: "low" | "medium" | "high";
}

interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: "user" | "staff" | "admin";
  status?: "active" | "inactive" | "locked";
  search?: string;
}

interface ListViolationsParams {
  page?: number;
  limit?: number;
  severity?: "low" | "medium" | "high";
  status?: "active" | "resolved";
  search?: string;
}

interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  department?: string;
  status?: "active" | "inactive" | "locked";
}

interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  status?: "active" | "inactive" | "locked";
  password?: string;
}

const toQueryString = (params: Record<string, unknown> | undefined) => {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const userService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      "/users/dashboard/stats",
    );
    return response.data.data;
  },

  async getUsers(
    params: ListUsersParams = {},
  ): Promise<PaginationResult<User>> {
    const query = toQueryString(params as Record<string, unknown>);
    const response = await api.get<PaginationResult<User>>(
      `/users${query ? `?${query}` : ""}`,
    );
    return response.data;
  },

  async getStaff(params: Omit<ListUsersParams, "role"> = {}) {
    const query = toQueryString(params as Record<string, unknown>);
    const response = await api.get<PaginationResult<User>>(
      `/users/staff${query ? `?${query}` : ""}`,
    );
    return response.data;
  },

  async getStaffById(staffId: string): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>(
      `/users/staff/${staffId}`,
    );
    return response.data.data;
  },

  async createStaff(payload: CreateStaffPayload): Promise<User> {
    const response = await api.post<{ success: boolean; data: User }>(
      "/users/staff",
      payload,
    );
    return response.data.data;
  },

  async updateStaff(
    staffId: string,
    payload: UpdateStaffPayload,
  ): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>(
      `/users/staff/${staffId}`,
      payload,
    );
    return response.data.data;
  },

  async deleteStaff(staffId: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/users/staff/${staffId}`,
    );
    return response.data;
  },

  async updateUserRole(userId: string, role: "user" | "staff" | "admin") {
    const response = await api.patch<{ success: boolean; data: User }>(
      `/users/${userId}/role`,
      { role },
    );
    return response.data;
  },

  async updateUserStatus(
    userId: string,
    status: "active" | "inactive" | "locked",
  ) {
    const response = await api.patch<{ success: boolean; data: User }>(
      `/users/${userId}/status`,
      { status },
    );
    return response.data;
  },

  async getPermissions() {
    const response = await api.get<{
      success: boolean;
      data: RolePermission[];
    }>("/users/permissions");
    return response.data.data;
  },

  async updatePermissions(
    role: "user" | "staff" | "admin",
    permissions: string[],
  ) {
    const response = await api.put<{ success: boolean; data: RolePermission }>(
      `/users/permissions/${role}`,
      { permissions },
    );
    return response.data;
  },

  async getViolatedUsers(
    params: ListViolationsParams = {},
  ): Promise<PaginationResult<ViolatedUser>> {
    const query = toQueryString(params as Record<string, unknown>);
    const response = await api.get<PaginationResult<ViolatedUser>>(
      `/users/violations${query ? `?${query}` : ""}`,
    );
    return response.data;
  },

  async createViolation(data: {
    userId: string;
    reason: string;
    severity: "low" | "medium" | "high";
  }) {
    const response = await api.post("/users/violations", data);
    return response.data;
  },

  async getMyProfile(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>(
      "/users/me/profile",
    );
    return response.data.data;
  },

  async updateMyProfile(payload: {
    name?: string;
    phone?: string;
    department?: string;
  }) {
    const response = await api.put<{ success: boolean; data: User }>(
      "/users/me/profile",
      payload,
    );
    return response.data.data;
  },

  async getUserProfile(userId: string): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>(
      `/users/${userId}/profile`,
    );
    return response.data.data;
  },

  async updateUserProfile(
    userId: string,
    payload: { name?: string; phone?: string; department?: string },
  ) {
    const response = await api.put<{ success: boolean; data: User }>(
      `/users/${userId}/profile`,
      payload,
    );
    return response.data.data;
  },
};
