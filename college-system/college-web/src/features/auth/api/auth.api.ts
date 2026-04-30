import apiClient from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const loginApi = async (payload: { identifier: string; password: string; deviceToken?: string }) => {
  const { deviceToken, ...body } = payload;
  const response = await apiClient.post<
    ApiResponse<{ user: AuthUser; accessToken: string; refreshToken: string }>
  >("/auth/login", body, {
    headers: deviceToken ? { "X-Device-Token": deviceToken } : {},
  });
  return response.data.data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const getMeApi = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return response.data.data;
};

export const updateProfileApi = async (payload: {
  firstName: string;
  lastName: string;
}): Promise<{ fullName: string }> => {
  const response = await apiClient.put<ApiResponse<{ fullName: string }>>(
    "/auth/profile",
    payload
  );
  return response.data.data;
};

export const changePasswordApi = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.put("/auth/password", payload);
};

export const getRecoveryEmailApi = async (): Promise<{ recoveryEmail: string | null }> => {
  const res = await apiClient.get<ApiResponse<{ recoveryEmail: string | null }>>("/auth/recovery-email");
  return res.data.data;
};

export const sendRecoveryOtpApi = async (recoveryEmail: string): Promise<void> => {
  await apiClient.post("/auth/recovery-email/send-otp", { recoveryEmail });
};

export const verifyRecoveryEmailApi = async (payload: {
  recoveryEmail: string;
  otp: string;
}): Promise<void> => {
  await apiClient.post("/auth/recovery-email/verify", payload);
};

export const sendPasswordResetOtpApi = async (payload: { email: string; recoveryEmail: string }): Promise<void> => {
  await apiClient.post("/auth/forgot-password", payload);
};

export const resetPasswordApi = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.post("/auth/reset-password", payload);
};

export const refreshTokenApi = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await apiClient.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh-token", { refreshToken });
  return response.data.data;
};
