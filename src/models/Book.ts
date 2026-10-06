import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class Book extends Model<InferAttributes<Book>, InferCreationAttributes<Book>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare author: string;
  declare genre: string;
  declare isbn: string | null;
  declare publishedYear: number | null;
  declare isAvailable: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initBookModel(sequelize: Sequelize) {
  Book.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      genre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isbn: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      publishedYear: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "books",
      underscored: true,
    },
  );

  return Book;
}
