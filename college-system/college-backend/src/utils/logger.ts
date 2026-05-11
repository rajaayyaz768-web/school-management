import { Request } from 'express'
import winston from "winston";

const { combine, timestamp: winstonTimestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
  colorize(),
  winstonTimestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => `${timestamp} [${level}]: ${stack || message}`)
);

const prodFormat = combine(
  winstonTimestamp(),
  errors({ stack: true }),
  winston.format.json()
);

const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
      ]
      : []),
  ],
});

// eslint-disable-next-line no-control-regex
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

function log(level: 'info' | 'warn' | 'error' | 'debug', prefix: string, message: string): void {
  winstonLogger[level](`[${prefix}] ${stripAnsi(message)}`);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export const logger = {
  // Winston passthrough — unchanged callers keep working
  info: winstonLogger.info.bind(winstonLogger),
  error: winstonLogger.error.bind(winstonLogger),
  warn: winstonLogger.warn.bind(winstonLogger),
  debug: winstonLogger.debug.bind(winstonLogger),

  server: (message: string) => log('info', 'SERVER', message),

  database: (message: string, success: boolean = true) =>
    log(success ? 'info' : 'error', 'DB', message),

  request: (req: Request) => {
    const user = (req as any).user;
    const userInfo = user ? `User:${user.email} Role:${user.role}` : 'Unauthenticated';
    log('debug', 'REQ', `${req.method} ${req.originalUrl} IP:${req.ip ?? 'unknown'} ${userInfo}`);
  },

  response: (req: Request, statusCode: number, durationMs: number) => {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'debug';
    log(level, 'RES', `${statusCode} ${req.method} ${req.originalUrl} ${formatDuration(durationMs)}`);
  },

  auth: {
    loginAttempt: (email: string, ip: string) =>
      log('info', 'AUTH', `Login attempt: ${email} from ${ip}`),
    loginSuccess: (email: string, role: string, userId: string) =>
      log('info', 'AUTH', `Login success: ${email} role=${role} userId=${userId}`),
    loginFailed: (email: string, reason: string) =>
      log('warn', 'AUTH', `Login failed: ${email} reason=${reason}`),
    logout: (email: string, userId: string) =>
      log('info', 'AUTH', `Logout: ${email} userId=${userId}`),
    tokenRefresh: (userId: string) =>
      log('debug', 'AUTH', `Token refreshed userId=${userId}`),
    unauthorized: (url: string, reason: string) =>
      log('warn', 'AUTH', `Unauthorized: ${url} reason=${reason}`),
  },

  db: {
    query: (model: string, operation: string, params?: object) => {
      const paramStr = params ? ` params=${JSON.stringify(params)}` : '';
      log('debug', 'DB', `${model}.${operation}${paramStr}`);
    },
    success: (model: string, operation: string, resultCount?: number) => {
      const countStr = resultCount !== undefined ? ` results=${resultCount}` : '';
      log('debug', 'DB', `${model}.${operation} ok${countStr}`);
    },
    error: (model: string, operation: string, error: unknown) => {
      const err = error as any;
      const code = err?.code ?? 'UNKNOWN';
      const message = err?.message ?? String(error);
      const meta = err?.meta ? ` meta=${JSON.stringify(err.meta)}` : '';
      log('error', 'DB', `${model}.${operation} FAILED code=${code} ${message}${meta}`);
      // Diagnose common Prisma errors for structured log consumers
      if (code === 'P2002') log('error', 'DB', 'DUPLICATE: Unique constraint violation');
      if (code === 'P2003') log('error', 'DB', 'FOREIGN KEY: Referenced record does not exist');
      if (code === 'P2025') log('error', 'DB', 'NOT FOUND: Record to update/delete does not exist');
    },
    poolConnected: () => log('info', 'DB POOL', 'Connection pool initialized'),
  },

  formData: (endpoint: string, data: object, userId?: string) => {
    const sanitized = { ...data } as any;
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.passwordHash) sanitized.passwordHash = '[REDACTED]';
    if (sanitized.temporaryPassword) sanitized.temporaryPassword = '[REDACTED]';
    const userStr = userId ? ` by=${userId}` : '';
    log('debug', 'FORM', `${endpoint}${userStr} ${JSON.stringify(sanitized)}`);
  },

  validation: (endpoint: string, errs: object[]) => {
    const summary = errs
      .map((e: any) => `${e.path?.join('.') ?? 'unknown'}: ${e.message}`)
      .join('; ');
    log('warn', 'VALIDATION', `${endpoint} ${summary}`);
  },

  success: (message: string) => log('info', 'OK', message),
}

export default logger;
