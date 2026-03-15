"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to appropriate dashboard based on role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (user.role === "staff") {
        router.push("/dashboard/staff");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-accent">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-2xl font-bold text-white">
          <BookOpen size={32} />
          <span>StudyHub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-white hover:text-gray-200 transition font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-white text-primary rounded-btn font-semibold hover:bg-gray-100 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Book Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Study Room
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Find and book the perfect study space instantly. Manage your
            bookings, track payments, and collaborate with ease.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary font-bold rounded-btn text-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight
                size={24}
                className="group-hover:translate-x-1 transition"
              />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/20 text-white font-bold rounded-btn text-lg hover:bg-white/30 transition border border-white/40"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-md rounded-card p-6 border border-white/20">
              <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
              <div className="text-gray-300">Study Rooms</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-card p-6 border border-white/20">
              <div className="text-4xl font-bold text-cyan-400 mb-2">10K+</div>
              <div className="text-gray-300">Happy Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-card p-6 border border-white/20">
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-300">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-card p-8 border border-white/20 hover:border-white/40 transition">
              <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mb-4">
                <Calendar size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Easy Booking
              </h3>
              <p className="text-gray-300">
                Browse available rooms, check time slots, and reserve your
                perfect study space in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-card p-8 border border-white/20 hover:border-white/40 transition">
              <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mb-4">
                <Zap size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-300">
                Instant confirmations, real-time availability, and seamless
                payment processing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-card p-8 border border-white/20 hover:border-white/40 transition">
              <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mb-4">
                <Users size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Collaborate
              </h3>
              <p className="text-gray-300">
                Share rooms with teammates and manage group bookings
                effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-black/30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Why Choose StudyHub?
          </h2>

          <div className="space-y-4">
            {[
              "✨ Premium study rooms with modern equipment",
              "💰 Transparent pricing with no hidden fees",
              "📱 Mobile-friendly dashboard and booking system",
              "🔒 Secure payments and data protection",
              "⭐ Highly-rated rooms and services",
              "🕐 Instant booking confirmations",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <CheckCircle
                  size={24}
                  className="text-cyan-400 flex-shrink-0"
                />
                <span className="text-lg text-gray-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-card p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Study Space?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already using StudyHub
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-primary font-bold rounded-btn text-lg hover:bg-gray-100 transition"
          >
            Start Booking Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                <BookOpen size={24} />
                StudyHub
              </div>
              <p className="text-gray-400 text-sm">
                Your ultimate study room booking platform
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 StudyHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
