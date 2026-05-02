import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import Cookies from "js-cookie";
import { queryClient } from "@/lib/queryClient";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "PARENT"
  | "STUDENT";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  campusId: string | null;
  fullName?: string;
  profilePhotoUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        Cookies.set("access-token", accessToken, { expires: 1 });
        Cookies.set("user-role", user.role, { expires: 1 });
        connectSocket(user.id);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setTokens: (accessToken, refreshToken) => {
        Cookies.set("access-token", accessToken, { expires: 1 });
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        }));
      },

      logout: () => {
        Cookies.remove("access-token");
        Cookies.remove("user-role");
        disconnectSocket();
        queryClient.clear();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "college-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Convenience Selectors
export const useRole = () => useAuthStore((state) => state.user?.role ?? null);
export const useHasRole = (...roles: UserRole[]) =>
  useAuthStore((state) => {
    const userRole = state.user?.role;
    return userRole ? roles.includes(userRole) : false;
  });
export const useCurrentUser = () => useAuthStore((state) => state.user);

/** Dashboard path per role */
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: "/principal/dashboard",
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  PARENT: "/parent/dashboard",
  STUDENT: "/student/dashboard",
};
