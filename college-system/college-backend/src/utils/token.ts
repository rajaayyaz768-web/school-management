import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpires,
  } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpires,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, jwtConfig.accessSecret) as JwtPayload &
    TokenPayload;
  return {
    userId: decoded.userId,
    role: decoded.role,
    email: decoded.email,
  };
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload &
    TokenPayload;
  return {
    userId: decoded.userId,
    role: decoded.role,
    email: decoded.email,
  };
};
