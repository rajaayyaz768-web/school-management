import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { sendValidationError } from "../utils/response";

/**
 * Wraps a Zod schema and validates req.body, req.params, req.query.
 *
 * Usage: router.post('/login', validate(loginSchema), controller)
 */
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.slice(1).join(".")}: ${e.message}`)
          .join(" | ");
        sendValidationError(res, message);
        return;
      }
      next(err);
    }
  };
