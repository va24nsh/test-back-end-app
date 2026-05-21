'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create subscriptions table
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      monthly_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      yearly_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      price_currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      trial_period_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      grace_period_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_default_plan: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      extra_info: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('subscriptions', ['code'], { unique: true });
    await queryInterface.addIndex('subscriptions', ['is_active']);
    await queryInterface.addIndex('subscriptions', ['is_public']);

    // Create user_subscriptions table
    await queryInterface.createTable('user_subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'subscriptions', key: 'id' },
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'CANCEL', 'HOLD', 'DEACTIVATED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      term: {
        type: Sequelize.ENUM('MONTHLY', 'YEARLY'),
        allowNull: false,
        defaultValue: 'MONTHLY',
      },
      type: {
        type: Sequelize.ENUM('PAID', 'FREEMIUM'),
        allowNull: false,
        defaultValue: 'PAID',
      },
      freemium_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      freemium_end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      next_billing_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_manual_payment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('user_subscriptions', ['user_id']);
    await queryInterface.addIndex('user_subscriptions', ['status']);
    await queryInterface.addIndex('user_subscriptions', ['user_id', 'status']);
    await queryInterface.addIndex('user_subscriptions', ['next_billing_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_subscriptions');
    await queryInterface.dropTable('subscriptions');
  }
};
