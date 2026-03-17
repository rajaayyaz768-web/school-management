import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { sendValidationError } from "../utils/response";

/**
 * Wraps a Zod schema and validates req.body, req.params, req.query.
 *
 * Usage: router.post('/login', validate(loginSchema), controller)
 */
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const message = (err as any).errors
          .map((e: any) => `${e.path.slice(1).join(".")}: ${e.message}`)
          .join(" | ");
        sendValidationError(res, message);
        return;
      }
      next(err);
    }
  };
