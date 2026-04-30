"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function getOrCreateDeviceToken(): string {
  try {
    const KEY = "collegeAdminDeviceToken";
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const token = crypto.randomUUID();
    localStorage.setItem(KEY, token);
    return token;
  } catch {
    return ""; // SSR safety
  }
}
import {
  loginApi, logoutApi, getMeApi,
  updateProfileApi, changePasswordApi,
  getRecoveryEmailApi, sendRecoveryOtpApi, verifyRecoveryEmailApi,
  sendPasswordResetOtpApi, resetPasswordApi,
} from "@/features/auth/api/auth.api";
import { useAuthStore, ROLE_DASHBOARD } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (vars: { identifier: string; password: string }) =>
      loginApi({ ...vars, deviceToken: getOrCreateDeviceToken() }),
    onSuccess: (data, variables) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      qc.clear();
      toast.success('Login successful');
      console.log('%c[LOGIN SUCCESS]', 'color: #10B981; font-weight: bold', {
        identifier: variables?.identifier,
        role: data?.user?.role,
        userId: data?.user?.id
      });
      router.replace(ROLE_DASHBOARD[data.user.role]);
    },
    onError: (error: any, variables) => {
      toast.error(error?.response?.data?.message ?? 'Invalid credentials');
      console.error('%c[LOGIN FAILED]', 'color: #EF4444; font-weight: bold', {
        identifier: variables?.identifier,
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

export function useUpdateProfile() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const toast = useToast();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      if (user && accessToken && refreshToken != null) {
        setAuth({ ...user, fullName: data.fullName }, accessToken, refreshToken);
      }
      toast.success("Name updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to update name");
    },
  });
}

export function useChangePassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to change password");
    },
  });
}

export function useRecoveryEmail() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["auth", "recovery-email"],
    queryFn: getRecoveryEmailApi,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSendRecoveryOtp() {
  const toast = useToast();
  return useMutation({
    mutationFn: sendRecoveryOtpApi,
    onSuccess: () => toast.success("OTP sent — check your recovery email"),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to send OTP"),
  });
}

export function useVerifyRecoveryEmail() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: verifyRecoveryEmailApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "recovery-email"] });
      toast.success("Recovery email verified and saved");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Invalid or expired OTP"),
  });
}

export function useSendPasswordResetOtp() {
  const toast = useToast();
  return useMutation({
    mutationFn: sendPasswordResetOtpApi,
    onSuccess: () => toast.success("OTP sent — check your recovery email inbox"),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Something went wrong"),
  });
}

export function useResetPassword() {
  const toast = useToast();
  return useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => toast.success("Password reset successfully — please sign in"),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to reset password"),
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
