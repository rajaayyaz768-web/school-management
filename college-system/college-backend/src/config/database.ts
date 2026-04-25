import { PrismaClient } from "@prisma/client";

// ─── Prisma Client Singleton ─────────────────────────────────────────────────
//
// Problem we solve: ts-node-dev restarts the server on every file save.
// Without this pattern, each restart creates a NEW PrismaClient connection
// pool, quickly exhausting Neon's 10-connection limit in development.
//
// Solution: We store the PrismaClient on the Node.js `global` object.
// The global object persists across hot-reloads. So:
//   - First load  → create new PrismaClient, save to global
//   - Every reload → reuse the existing one from global, no new pool
//

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL
  ? process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=10&pool_timeout=20'
  : undefined;

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasourceUrl: DATABASE_URL,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
