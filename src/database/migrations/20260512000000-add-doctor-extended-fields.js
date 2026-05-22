'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('doctors', 'fees', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('doctors', 'years_experience', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('doctors', 'qualification', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('doctors', 'fees');
    await queryInterface.removeColumn('doctors', 'years_experience');
    await queryInterface.removeColumn('doctors', 'qualification');
  }
};
