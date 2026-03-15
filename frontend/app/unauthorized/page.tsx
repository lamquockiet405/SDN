import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block mb-6 p-4 bg-white rounded-full">
          <Lock size={64} className="text-danger" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white text-lg mb-8">
          You don't have permission to access this page
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-btn hover:bg-gray-100 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
