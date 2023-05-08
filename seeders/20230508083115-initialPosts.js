"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Posts", [
      {
        id: 1,
        title: "할 일",
        comment: "코멘트",
        order: 1,
        section: "todo",
        is_hide: false,
        user_id: 1,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Posts", null, {});
  },
};
