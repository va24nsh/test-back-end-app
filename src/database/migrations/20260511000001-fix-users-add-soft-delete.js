'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add soft delete column to users
    await queryInterface.addColumn('users', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Soft delete timestamp'
    });

    // Add index on deleted_at
    await queryInterface.addIndex('users', ['deleted_at'], {
      name: 'idx_users_deleted_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'idx_users_deleted_at');
    await queryInterface.removeColumn('users', 'deleted_at');
  }
};
