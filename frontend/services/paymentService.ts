import api from "@/lib/axios";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  createdAt: string;
}

export const paymentService = {
  async processPayment(bookingId: string, amount: number): Promise<Payment> {
    const response = await api.post("/payments", {
      bookingId,
      amount,
    });
    return response.data;
  },

  async getPayments(): Promise<Payment[]> {
    const response = await api.get("/payments");
    return response.data;
  },

  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async refundPayment(id: string): Promise<Payment> {
    const response = await api.post(`/payments/${id}/refund`);
    return response.data;
  },
};
