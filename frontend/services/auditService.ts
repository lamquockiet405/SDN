import api from "@/lib/axios";

export interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  ipAddress: string;
  userAgent?: string;
  status: "success" | "failed";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  page: number;
  logs: AuditLog[];
}

export interface AuditSearchParams {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const auditService = {
  async getAllAuditLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<AuditLogsResponse> {
    const response = await api.get("/audit-logs", {
      params: { page, limit },
    });
    return response.data;
  },

  async searchAuditLogs(
    searchParams: AuditSearchParams,
  ): Promise<AuditLogsResponse> {
    const response = await api.get("/audit-logs/search", {
      params: searchParams,
    });
    return response.data;
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },

  async deleteAuditLog(id: string): Promise<void> {
    await api.delete(`/audit-logs/${id}`);
  },
};
