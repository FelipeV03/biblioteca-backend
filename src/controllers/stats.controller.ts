import { Request, Response } from "express";
import { getValidated } from "../middlewares/validate";
import { statsService } from "../services/stats.service";
import type { TopBooksQuery } from "../validators/stats.schema";

export const statsController = {
  async topBooks(req: Request, res: Response) {
    const { limit } = getValidated<TopBooksQuery>(req, "query");
    const data = await statsService.topBooks(limit);
    res.json({ data });
  },

  async loansSummary(_req: Request, res: Response) {
    const data = await statsService.loansSummary();
    res.json({ data });
  },

  async availabilityByGenre(_req: Request, res: Response) {
    const data = await statsService.availabilityByGenre();
    res.json({ data });
  },

  async averageLoanDuration(_req: Request, res: Response) {
    const data = await statsService.averageLoanDuration();
    res.json({ data });
  },
};
