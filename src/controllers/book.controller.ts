import { Request, Response } from "express";
import { getValidated } from "../middlewares/validate";
import { bookService } from "../services/book.service";
import type { CreateBookInput, ListBooksQuery, UpdateBookInput } from "../validators/book.schema";

export const bookController = {
  async list(req: Request, res: Response) {
    const query = getValidated<ListBooksQuery>(req, "query");
    const result = await bookService.list(query);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    const book = await bookService.getById(id);
    res.json({ data: book });
  },

  async create(req: Request, res: Response) {
    const input = getValidated<CreateBookInput>(req, "body");
    const book = await bookService.create(input);
    res.status(201).json({ data: book });
  },

  async update(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    const input = getValidated<UpdateBookInput>(req, "body");
    const book = await bookService.update(id, input);
    res.json({ data: book });
  },

  async remove(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    await bookService.remove(id);
    res.status(204).send();
  },
};
