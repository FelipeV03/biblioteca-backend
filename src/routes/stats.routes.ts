import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { validate } from "../middlewares/validate";
import { topBooksQuerySchema } from "../validators/stats.schema";

export const statsRoutes = Router();

statsRoutes.get("/top-books", validate(topBooksQuerySchema, "query"), statsController.topBooks);
statsRoutes.get("/loans-summary", statsController.loansSummary);
statsRoutes.get("/availability-by-genre", statsController.availabilityByGenre);
statsRoutes.get("/average-loan-duration", statsController.averageLoanDuration);
