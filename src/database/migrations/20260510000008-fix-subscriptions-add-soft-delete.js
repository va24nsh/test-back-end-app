'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add soft delete column to subscriptions
    await queryInterface.addColumn('subscriptions', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Soft delete timestamp'
    });

    // Add index on deleted_at
    await queryInterface.addIndex('subscriptions', ['deleted_at'], {
      name: 'idx_subscriptions_deleted_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('subscriptions', 'idx_subscriptions_deleted_at');
    await queryInterface.removeColumn('subscriptions', 'deleted_at');
  }
};
