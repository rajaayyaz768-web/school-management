const accessSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error(
    "FATAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set"
  );
}

export const jwtConfig = {
  accessSecret,
  refreshSecret,
  accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  cookieName: "refreshToken",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as
      | "strict"
      | "lax"
      | "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/",
  },
};
