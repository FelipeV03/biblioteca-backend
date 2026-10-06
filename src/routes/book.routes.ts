import { Router } from "express";
import { bookController } from "../controllers/book.controller";
import { validate } from "../middlewares/validate";
import { bookIdParamSchema, createBookSchema, listBooksQuerySchema, updateBookSchema } from "../validators/book.schema";

export const bookRoutes = Router();

bookRoutes.get("/", validate(listBooksQuerySchema, "query"), bookController.list);
bookRoutes.get("/:id", validate(bookIdParamSchema, "params"), bookController.getById);
bookRoutes.post("/", validate(createBookSchema, "body"), bookController.create);
bookRoutes.put(
  "/:id",
  validate(bookIdParamSchema, "params"),
  validate(updateBookSchema, "body"),
  bookController.update,
);
bookRoutes.delete("/:id", validate(bookIdParamSchema, "params"), bookController.remove);
