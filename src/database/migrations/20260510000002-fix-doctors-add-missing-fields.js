'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('doctors', 'sources', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Array of external platform names'
    });

    await queryInterface.addColumn('doctors', 'hospital_address', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('doctors', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('doctors', 'phone_number', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('doctors', 'sources');
    await queryInterface.removeColumn('doctors', 'hospital_address');
    await queryInterface.removeColumn('doctors', 'email');
    await queryInterface.removeColumn('doctors', 'phone_number');
  }
};
