import { Router } from "express";
import { bookRoutes } from "./book.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ data: { status: "ok" } });
});

apiRouter.use("/books", bookRoutes);
