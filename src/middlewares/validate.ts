import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../errors/ValidationError";

type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodType, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(new ValidationError("Datos inválidos", result.error.flatten().fieldErrors));
      return;
    }

    req.validated = req.validated ?? {};
    req.validated[target] = result.data;
    next();
  };
}

export function getValidated<T>(req: Request, target: ValidateTarget): T {
  return req.validated?.[target] as T;
}
