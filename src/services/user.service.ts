import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { userRepository } from "../repositories/user.repository";
import type { CreateUserInput, UpdateUserInput } from "../validators/user.schema";

export const userService = {
  async list() {
    const users = await userRepository.findAll();
    return { data: users };
  },

  async getById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    return user;
  },

  async create(input: CreateUserInput) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ValidationError("Ya existe un usuario con ese email", { email: ["El email ya está registrado"] });
    }

    const existingDocument = await userRepository.findByDocumentNumber(input.documentNumber);
    if (existingDocument) {
      throw new ValidationError("Ya existe un usuario con ese número de documento", {
        documentNumber: ["El número de documento ya está registrado"],
      });
    }

    return userRepository.create(input);
  },

  async update(id: number, input: UpdateUserInput) {
    await this.getById(id);

    if (input.email) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new ValidationError("Ya existe un usuario con ese email", { email: ["El email ya está registrado"] });
      }
    }

    if (input.documentNumber) {
      const existing = await userRepository.findByDocumentNumber(input.documentNumber);
      if (existing && existing.id !== id) {
        throw new ValidationError("Ya existe un usuario con ese número de documento", {
          documentNumber: ["El número de documento ya está registrado"],
        });
      }
    }

    return userRepository.update(id, input);
  },
};
