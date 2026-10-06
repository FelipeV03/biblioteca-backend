import { sequelize } from "../config/database";
import { initBookModel } from "./Book";
import { initLoanModel } from "./Loan";
import { initUserModel } from "./User";

export const Book = initBookModel(sequelize);
export const User = initUserModel(sequelize);
export const Loan = initLoanModel(sequelize);

Book.hasMany(Loan, { foreignKey: "bookId", as: "loans" });
Loan.belongsTo(Book, { foreignKey: "bookId", as: "book" });

User.hasMany(Loan, { foreignKey: "userId", as: "loans" });
Loan.belongsTo(User, { foreignKey: "userId", as: "user" });

export { sequelize };
