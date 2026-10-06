import { Router } from "express";
import { bookRoutes } from "./book.routes";
import { loanRoutes } from "./loan.routes";
import { userRoutes } from "./user.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ data: { status: "ok" } });
});

apiRouter.use("/books", bookRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/loans", loanRoutes);
