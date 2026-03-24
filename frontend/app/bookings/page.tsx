"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import UserBookingHistoryPage from "@/components/dashboard/UserBookingHistoryPage";

export default function BookingsPage() {
  return (
    <DashboardLayout title="Booking History">
      <UserBookingHistoryPage title="Booking History" />
    </DashboardLayout>
  );
}
