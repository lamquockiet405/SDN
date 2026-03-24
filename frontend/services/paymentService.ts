import api from "@/lib/axios";

export interface PaymentTransaction {
  _id: string;
  userId: string;
  bookingId:
    | string
    | {
        _id?: string;
        startTime?: string;
        endTime?: string;
        totalPrice?: number;
        status?: string;
      };
  orderId: string;
  amount: number;
  currency: string;
  provider: "manual";
  status: "pending" | "success" | "failed" | "cancelled";
  paymentUrl?: string;
  txnRef: string;
  bankCode?: string;
  transactionNo?: string;
  paidAt?: string;
  rawResponse?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateDirectPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    bookingId: string;
    amount: number;
    status: "success";
    provider: "manual";
  };
}

export const paymentService = {
  async createDirectPayment(payload: {
    bookingId: string;
    amount?: number;
  }): Promise<CreateDirectPaymentResponse> {
    const response = await api.post("/payments/pay", payload);
    return response.data as CreateDirectPaymentResponse;
  },

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "success" | "failed" | "cancelled";
  }): Promise<PaymentHistoryResponse> {
    const response = await api.get("/payments/history", { params });
    return response.data as PaymentHistoryResponse;
  },
};
