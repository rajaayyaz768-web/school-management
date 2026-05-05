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

// Append pool + keepalive params so idle connections don't get silently
// dropped by firewalls/NAT before PostgreSQL's own keepalive fires.
const DATABASE_URL = process.env.DATABASE_URL
  ? process.env.DATABASE_URL +
    (process.env.DATABASE_URL.includes('?') ? '&' : '?') +
    'connection_limit=5&pool_timeout=20&connect_timeout=10&keepalives=1&keepalives_idle=30&keepalives_interval=10&keepalives_count=5'
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
