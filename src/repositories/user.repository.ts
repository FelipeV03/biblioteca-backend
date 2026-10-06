import { User } from "../models";

export interface CreateUserData {
  name: string;
  email: string;
}

export type UpdateUserData = Partial<CreateUserData>;

export const userRepository = {
  findAll() {
    return User.findAll({ order: [["createdAt", "DESC"]] });
  },

  findById(id: number) {
    return User.findByPk(id);
  },

  findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  create(data: CreateUserData) {
    return User.create(data);
  },

  async update(id: number, data: UpdateUserData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  },
};
