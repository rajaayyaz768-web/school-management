"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi, logoutApi, getMeApi } from "@/features/auth/api/auth.api";
import { useAuthStore, ROLE_DASHBOARD } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data, variables) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      qc.clear();
      toast.success('Login successful');
      console.log('%c[LOGIN SUCCESS]', 'color: #10B981; font-weight: bold', {
        email: variables?.email,
        role: data?.user?.role,
        userId: data?.user?.id
      });
      router.replace(ROLE_DASHBOARD[data.user.role]);
    },
    onError: (error: any, variables) => {
      toast.error(error?.response?.data?.message ?? 'Invalid email or password');
      console.error('%c[LOGIN FAILED]', 'color: #EF4444; font-weight: bold', {
        email: variables?.email,
        error: error?.response?.data?.message ?? error?.message
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logout();
      qc.clear();
      toast.info('Logged out successfully');
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
