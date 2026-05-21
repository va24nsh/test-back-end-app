'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      activity_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      activity_category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    }, {
      partitionBy: 'RANGE COLUMNS(created_at)',
      partitions: [
        { name: 'activity_2025', values: ['2025-12-31'] },
        { name: 'activity_2026', values: ['2026-12-31'] },
        { name: 'activity_2027', values: ['2027-12-31'] },
        { name: 'activity_future', values: ['MAXVALUE'] },
      ],
    });

    await queryInterface.addIndex('activity_logs', ['user_id']);
    await queryInterface.addIndex('activity_logs', ['activity_type']);
    await queryInterface.addIndex('activity_logs', ['created_at']);
    await queryInterface.addIndex('activity_logs', ['user_id', 'activity_type', 'created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_logs');
  }
};
