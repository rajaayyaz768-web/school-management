import { Queue, Worker } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import type { Router } from "express";
import { logger } from "../utils/logger";

// ─── Lazy queue instances (null until initQueues() is called) ─────────────────
// BullMQ uses ioredis internally and connects immediately on new Queue().
// We must NOT create Queue objects at module load — only after Redis is confirmed
// reachable. initQueues() is called from server.ts inside the Redis try block.

let _whatsappQueue: Queue | null = null;
let _emailQueue: Queue | null = null;
let _reportQueue: Queue | null = null;
let _boardRouter: Router | null = null;

export const getWhatsappQueue = () => _whatsappQueue;
export const getEmailQueue = () => _emailQueue;
export const getReportQueue = () => _reportQueue;
export const getBoardRouter = () => _boardRouter;

// ─── initQueues — called once after Redis is confirmed connected ───────────────

export function initQueues(redisUrl: string): void {
  const connection = { url: redisUrl };

  _whatsappQueue = new Queue("whatsapp", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  _emailQueue = new Queue("email", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: 50,
      removeOnFail: 200,
    },
  });

  _reportQueue = new Queue("reports", {
    connection,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: 20,
      removeOnFail: 50,
    },
  });

  // Bull Board — only set up after queues exist
  const boardAdapter = new ExpressAdapter();
  boardAdapter.setBasePath("/api/v1/admin/queues");
  createBullBoard({
    queues: [
      new BullMQAdapter(_whatsappQueue),
      new BullMQAdapter(_emailQueue),
      new BullMQAdapter(_reportQueue),
    ],
    serverAdapter: boardAdapter,
  });
  _boardRouter = boardAdapter.getRouter() as Router;

  logger.server("BullMQ queues initialized (whatsapp, email, reports)");
}

// ─── startWorkers — called after initQueues ───────────────────────────────────

export function startWorkers(redisUrl: string): void {
  const connection = { url: redisUrl };

  const whatsappWorker = new Worker(
    "whatsapp",
    async (job) => {
      const { type, toPhone, params } = job.data;
      if (type === "fee_paid") {
        const { sendFeePaidTemplate } = await import("../services/whatsapp/metaClient");
        return sendFeePaidTemplate(toPhone, params);
      }
      if (type === "credentials") {
        const { sendCredentialsWhatsApp } = await import("../services/whatsapp/metaClient");
        return sendCredentialsWhatsApp(toPhone, params);
      }
      throw new Error(`Unknown whatsapp job type: ${type}`);
    },
    { connection, concurrency: 5 }
  );

  const emailWorker = new Worker(
    "email",
    async (job) => {
      const { type, to, payload } = job.data;
      if (type === "password_reset") {
        const { sendPasswordResetEmail } = await import("../services/email.service");
        return sendPasswordResetEmail(to, payload.otp);
      }
      if (type === "recovery_verification") {
        const { sendRecoveryEmailVerification } = await import("../services/email.service");
        return sendRecoveryEmailVerification(to, payload.otp);
      }
      if (type === "staff_welcome") {
        const { sendStaffWelcomeEmail } = await import("../services/email.service");
        return sendStaffWelcomeEmail({ to, firstName: payload.firstName, lastName: payload.lastName, staffCode: payload.staffCode, loginEmail: payload.loginEmail, temporaryPassword: payload.temporaryPassword });
      }
      if (type === "otp") {
        const { sendOtpEmail } = await import("../services/email.service");
        return sendOtpEmail(to, payload.otp);
      }
      throw new Error(`Unknown email job type: ${type}`);
    },
    { connection, concurrency: 10 }
  );

  const reportWorker = new Worker(
    "reports",
    async (job) => {
      logger.info(`[QUEUE] Report job ${job.id} type=${job.data.type}`);
    },
    { connection, concurrency: 2 }
  );

  for (const [name, worker] of [
    ["whatsapp", whatsappWorker],
    ["email", emailWorker],
    ["report", reportWorker],
  ] as const) {
    worker.on("completed", (job) =>
      logger.info(`[QUEUE] ${name} job ${job.id} completed`)
    );
    worker.on("failed", (job, err) =>
      logger.error(`[QUEUE] ${name} job ${job?.id} failed: ${err.message}`)
    );
  }

  logger.server("BullMQ workers started (whatsapp, email, reports)");
}
