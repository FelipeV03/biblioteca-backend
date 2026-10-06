import { AppError } from "./AppError";

export class BusinessRuleError extends AppError {
  constructor(message: string, code = "BUSINESS_RULE_VIOLATION") {
    super(message, 409, code);
  }
}
