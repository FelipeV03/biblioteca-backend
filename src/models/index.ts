import { sequelize } from "../config/database";
import { initBookModel } from "./Book";

export const Book = initBookModel(sequelize);

export { sequelize };
