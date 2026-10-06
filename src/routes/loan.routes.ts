import { Router } from "express";
import { loanController } from "../controllers/loan.controller";
import { validate } from "../middlewares/validate";
import { createLoanSchema, listLoansQuerySchema, loanIdParamSchema } from "../validators/loan.schema";

export const loanRoutes = Router();

loanRoutes.get("/", validate(listLoansQuerySchema, "query"), loanController.list);
loanRoutes.get("/:id", validate(loanIdParamSchema, "params"), loanController.getById);
loanRoutes.post("/", validate(createLoanSchema, "body"), loanController.create);
loanRoutes.patch("/:id/return", validate(loanIdParamSchema, "params"), loanController.returnLoan);
