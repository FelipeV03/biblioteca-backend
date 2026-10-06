import { Request, Response } from "express";
import { getValidated } from "../middlewares/validate";
import { loanService } from "../services/loan.service";
import type { CreateLoanInput, ListLoansQuery } from "../validators/loan.schema";

export const loanController = {
  async list(req: Request, res: Response) {
    const query = getValidated<ListLoansQuery>(req, "query");
    const result = await loanService.list(query);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    const loan = await loanService.getById(id);
    res.json({ data: loan });
  },

  async create(req: Request, res: Response) {
    const input = getValidated<CreateLoanInput>(req, "body");
    const loan = await loanService.create(input);
    res.status(201).json({ data: loan });
  },

  async returnLoan(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    const loan = await loanService.returnLoan(id);
    res.json({ data: loan });
  },
};
