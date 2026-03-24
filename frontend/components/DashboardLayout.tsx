"use client";
import { Header } from "./Header";
import { ProtectedRoute } from "./ProtectedRoute";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <main className="flex-1 md:ml-64 overflow-auto">
          <Header title={title} />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
};
