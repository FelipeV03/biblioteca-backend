import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/NotFoundError";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}
