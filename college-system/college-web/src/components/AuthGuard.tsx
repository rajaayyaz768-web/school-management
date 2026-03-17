"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type UserRole, ROLE_DASHBOARD } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * Wraps a portal layout. Behaviour:
 *  - Not authenticated  → redirect to /login
 *  - Wrong role         → redirect to own dashboard
 *  - Correct role       → render children
 */
export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(ROLE_DASHBOARD[user.role]);
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#003366]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#003366]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return <>{children}</>;
}
