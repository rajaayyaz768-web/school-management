import { useAuthStore, type UserRole } from "@/store/authStore";

/**
 * Returns true if the currently authenticated user has one of the allowed roles.
 *
 * Usage:
 *   const canManage = usePermission(["SUPER_ADMIN", "ADMIN"]);
 */
export function usePermission(allowedRoles: UserRole[]): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return allowedRoles.includes(role);
}
