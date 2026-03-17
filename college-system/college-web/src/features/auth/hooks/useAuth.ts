"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi, logoutApi, getMeApi } from "@/features/auth/api/auth.api";
import { useAuthStore, ROLE_DASHBOARD } from "@/store/authStore";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      qc.clear();
      router.replace(ROLE_DASHBOARD[data.user.role]);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logout();
      qc.clear();
      router.replace("/login");
    },
  });
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMeApi,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
}
