import { Request } from 'express'
import winston from "winston";

const { combine, timestamp: winstonTimestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Keep the existing winston logger for backward compatibility
const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: combine(
    colorize(),
    winstonTimestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
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

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

function timestamp(): string {
  return new Date().toISOString()
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export const logger = {
  // Backward compat with existing winston calls (logger.info, logger.error, logger.warn, logger.debug)
  info: winstonLogger.info.bind(winstonLogger),
  error: winstonLogger.error.bind(winstonLogger),
  warn: winstonLogger.warn.bind(winstonLogger),
  debug: winstonLogger.debug.bind(winstonLogger),

  // Server startup messages
  server: (message: string) => {
    console.log(`${colors.cyan}${colors.bright}[SERVER]${colors.reset} ${colors.cyan}${timestamp()}${colors.reset} ${message}`)
  },

  // Database connection messages
  database: (message: string, success: boolean = true) => {
    const color = success ? colors.green : colors.red
    const label = success ? '[DB ✓]' : '[DB ✗]'
    console.log(`${color}${colors.bright}${label}${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${message}`)
  },

  // Incoming HTTP request
  request: (req: Request) => {
    const method = req.method
    const url = req.originalUrl
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    const user = (req as any).user
    const userInfo = user ? `[User: ${user.email} | Role: ${user.role}]` : '[Unauthenticated]'
    console.log(`${colors.blue}${colors.bright}[REQ →]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${colors.bright}${method}${colors.reset} ${url} ${colors.gray}IP:${ip}${colors.reset} ${colors.magenta}${userInfo}${colors.reset}`)
  },

  // Successful HTTP response
  response: (req: Request, statusCode: number, durationMs: number) => {
    const method = req.method
    const url = req.originalUrl
    const color = statusCode >= 400 ? colors.red : statusCode >= 300 ? colors.yellow : colors.green
    console.log(`${color}${colors.bright}[RES ←]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${color}${statusCode}${colors.reset} ${colors.bright}${method}${colors.reset} ${url} ${colors.gray}${formatDuration(durationMs)}${colors.reset}`)
  },

  // Authentication events
  auth: {
    loginAttempt: (email: string, ip: string) => {
      console.log(`${colors.yellow}${colors.bright}[AUTH]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Login attempt for: ${colors.bright}${email}${colors.reset} from IP: ${ip}`)
    },
    loginSuccess: (email: string, role: string, userId: string) => {
      console.log(`${colors.green}${colors.bright}[AUTH ✓]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Login SUCCESS — Email: ${colors.bright}${email}${colors.reset} | Role: ${colors.cyan}${role}${colors.reset} | UserID: ${colors.gray}${userId}${colors.reset}`)
    },
    loginFailed: (email: string, reason: string) => {
      console.log(`${colors.red}${colors.bright}[AUTH ✗]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Login FAILED — Email: ${colors.bright}${email}${colors.reset} | Reason: ${colors.red}${reason}${colors.reset}`)
    },
    logout: (email: string, userId: string) => {
      console.log(`${colors.yellow}${colors.bright}[AUTH]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Logout — Email: ${colors.bright}${email}${colors.reset} | UserID: ${colors.gray}${userId}${colors.reset}`)
    },
    tokenRefresh: (userId: string) => {
      console.log(`${colors.cyan}[AUTH]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Token refreshed for UserID: ${userId}`)
    },
    unauthorized: (url: string, reason: string) => {
      console.log(`${colors.red}${colors.bright}[AUTH ✗]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Unauthorized access to ${colors.bright}${url}${colors.reset} — ${colors.red}${reason}${colors.reset}`)
    },
  },

  // Database operations
  db: {
    query: (model: string, operation: string, params?: object) => {
      const paramStr = params ? ` | Params: ${JSON.stringify(params)}` : ''
      console.log(`${colors.cyan}[DB]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${colors.bright}${model}.${operation}${colors.reset}${colors.gray}${paramStr}${colors.reset}`)
    },
    success: (model: string, operation: string, resultCount?: number) => {
      const countStr = resultCount !== undefined ? ` | Results: ${resultCount}` : ''
      console.log(`${colors.green}[DB ✓]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${colors.bright}${model}.${operation}${colors.reset} succeeded${colors.gray}${countStr}${colors.reset}`)
    },
    error: (model: string, operation: string, error: unknown) => {
      const err = error as any
      const message = err?.message ?? String(error)
      const code = err?.code ?? 'UNKNOWN'
      const meta = err?.meta ? ` | Meta: ${JSON.stringify(err.meta)}` : ''
      console.error(`${colors.red}${colors.bright}[DB ✗]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${colors.bright}${model}.${operation}${colors.reset} FAILED`)
      console.error(`  ${colors.red}Code: ${code}${colors.reset}`)
      console.error(`  ${colors.red}Message: ${message}${colors.reset}${meta}`)
      // Diagnose common Prisma errors
      if (code === 'P2002') console.error(`  ${colors.yellow}→ DUPLICATE: Unique constraint violation${colors.reset}`)
      if (code === 'P2003') console.error(`  ${colors.yellow}→ FOREIGN KEY: Referenced record does not exist${colors.reset}`)
      if (code === 'P2025') console.error(`  ${colors.yellow}→ NOT FOUND: Record to update/delete does not exist${colors.reset}`)
      if (code === 'P2021') console.error(`  ${colors.yellow}→ TABLE NOT FOUND: Run prisma migrate dev${colors.reset}`)
      if (code === 'P2022') console.error(`  ${colors.yellow}→ COLUMN NOT FOUND: Check field names match schema.prisma${colors.reset}`)
      if (message.includes('connect')) console.error(`  ${colors.yellow}→ CONNECTION: Cannot reach database — check DATABASE_URL${colors.reset}`)
    },
    poolConnected: () => {
      console.log(`${colors.green}${colors.bright}[DB POOL ✓]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Database connection pool initialized successfully`)
    },
  },

  // Form data / API body received
  formData: (endpoint: string, data: object, userId?: string) => {
    const userStr = userId ? ` | By: ${userId}` : ''
    console.log(`${colors.magenta}[FORM]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Data received at ${colors.bright}${endpoint}${colors.reset}${userStr}`)
    // Sanitize — never log passwords
    const sanitized = { ...data } as any
    if (sanitized.password) sanitized.password = '[REDACTED]'
    if (sanitized.passwordHash) sanitized.passwordHash = '[REDACTED]'
    if (sanitized.temporaryPassword) sanitized.temporaryPassword = '[REDACTED]'
    console.log(`  ${colors.gray}${JSON.stringify(sanitized, null, 2)}${colors.reset}`)
  },

  // Validation errors
  validation: (endpoint: string, errors: object[]) => {
    console.log(`${colors.yellow}${colors.bright}[VALIDATION ✗]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} Validation failed at ${colors.bright}${endpoint}${colors.reset}`)
    errors.forEach((e: any) => {
      console.log(`  ${colors.yellow}→ Field: ${e.path?.join('.') ?? 'unknown'} | ${e.message}${colors.reset}`)
    })
  },

  // General success
  success: (message: string) => {
    console.log(`${colors.green}[OK]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${message}`)
  },
}

export default logger;
