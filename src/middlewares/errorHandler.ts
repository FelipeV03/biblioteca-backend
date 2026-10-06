import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...("details" in err ? { details: (err as { details: unknown }).details } : {}),
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: {
      message: "Error interno del servidor",
      code: "INTERNAL_ERROR",
    },
  });
}
