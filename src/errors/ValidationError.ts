import { AppError } from "./AppError";

export class ValidationError extends AppError {
  public readonly details: Record<string, string[] | undefined>;

  constructor(message = "Datos inválidos", details: Record<string, string[] | undefined> = {}) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}
