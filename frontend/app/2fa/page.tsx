"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TwoFactorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/user?tab=2fa");
  }, [router]);

  return null;
}
