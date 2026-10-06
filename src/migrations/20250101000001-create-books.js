"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("books", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      genre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      isbn: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      published_year: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("books", ["genre"]);
    await queryInterface.addIndex("books", ["is_available"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("books");
  },
};
