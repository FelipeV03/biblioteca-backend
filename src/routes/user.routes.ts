import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../validators/user.schema";

export const userRoutes = Router();

userRoutes.get("/", userController.list);
userRoutes.get("/:id", validate(userIdParamSchema, "params"), userController.getById);
userRoutes.post("/", validate(createUserSchema, "body"), userController.create);
userRoutes.put(
  "/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema, "body"),
  userController.update,
);
