'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create user_subscription_payment_info table
    await queryInterface.createTable('user_subscription_payment_info', {
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
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      payment_provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_provider_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      card_last_four: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      card_brand: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      billing_address: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('user_subscription_payment_info', ['user_id']);

    // Create user_subscription_invoices table
    await queryInterface.createTable('user_subscription_invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user_subscriptions', key: 'id' },
        onDelete: 'CASCADE',
      },
      invoice_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      invoice_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      term: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      is_manual_payment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      paid_via: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      billing_period_start: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      billing_period_end: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payment_provider_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      invoice_url: {
        type: Sequelize.STRING(2000),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('user_subscription_invoices', ['user_subscription_id']);
    await queryInterface.addIndex('user_subscription_invoices', ['invoice_number'], { unique: true });
    await queryInterface.addIndex('user_subscription_invoices', ['status']);
    await queryInterface.addIndex('user_subscription_invoices', ['due_date']);

    // Create user_subscription_audit_logs table
    await queryInterface.createTable('user_subscription_audit_logs', {
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
      user_subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user_subscriptions', key: 'id' },
        onDelete: 'SET NULL',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      change_title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      change_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      change_details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      old_value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      new_value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
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
    });

    await queryInterface.addIndex('user_subscription_audit_logs', ['user_id']);
    await queryInterface.addIndex('user_subscription_audit_logs', ['user_subscription_id']);
    await queryInterface.addIndex('user_subscription_audit_logs', ['action']);
    await queryInterface.addIndex('user_subscription_audit_logs', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_subscription_audit_logs');
    await queryInterface.dropTable('user_subscription_invoices');
    await queryInterface.dropTable('user_subscription_payment_info');
  }
};
