"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "document_number", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addIndex("users", ["document_number"], {
      unique: true,
      name: "users_document_number_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("users", "users_document_number_unique");
    await queryInterface.removeColumn("users", "document_number");
  },
};
