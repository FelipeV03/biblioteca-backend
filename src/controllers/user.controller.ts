import { Request, Response } from "express";
import { getValidated } from "../middlewares/validate";
import { userService } from "../services/user.service";
import type { CreateUserInput, UpdateUserInput } from "../validators/user.schema";

export const userController = {
  async list(_req: Request, res: Response) {
    const result = await userService.list();
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    const user = await userService.getById(id);
    res.json({ data: user });
  },

  async create(req: Request, res: Response) {
    const input = getValidated<CreateUserInput>(req, "body");
    const user = await userService.create(input);
    res.status(201).json({ data: user });
  },

  async update(req: Request, res: Response) {
    const { id } = getValidated<{ id: number }>(req, "params");
    const input = getValidated<UpdateUserInput>(req, "body");
    const user = await userService.update(id, input);
    res.json({ data: user });
  },
};
