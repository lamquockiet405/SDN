import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRoleProtection(
  requiredRoles: Array<"admin" | "staff" | "user">,
) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (!requiredRoles.includes(user.role as any)) {
        // User doesn't have required role, redirect to unauthorized
        router.push("/unauthorized");
      }
    }
  }, [user, isLoading, router, requiredRoles]);

  return {
    isAuthorized:
      !isLoading && user && requiredRoles.includes(user.role as any),
    isLoading,
    user,
  };
}

export function useAdminProtection() {
  return useRoleProtection(["admin"]);
}

export function useStaffProtection() {
  return useRoleProtection(["admin", "staff"]);
}
