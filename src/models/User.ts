import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare documentNumber: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      documentNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "users",
      underscored: true,
    },
  );

  return User;
}
