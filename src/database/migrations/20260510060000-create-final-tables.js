'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create subscription_coupons table
    await queryInterface.createTable('subscription_coupons', {
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
      discount_methods: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      discount_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      allowed_users: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      disallowed_users: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      min_purchase_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      applicable_plans: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      max_uses: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      used_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('subscription_coupons', ['code'], { unique: true });
    await queryInterface.addIndex('subscription_coupons', ['is_active']);
    await queryInterface.addIndex('subscription_coupons', ['valid_from', 'valid_until']);

    // Create consent_audit_trail table
    await queryInterface.createTable('consent_audit_trail', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      consent_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'consent_requests', key: 'id' },
        onDelete: 'SET NULL',
      },
      action_type: {
        type: Sequelize.ENUM('CREATED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED', 'MODIFIED', 'VIEWED'),
        allowNull: false,
      },
      actor_type: {
        type: Sequelize.ENUM('PATIENT', 'DOCTOR', 'SYSTEM', 'ADMIN'),
        allowNull: false,
      },
      actor_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      action_details: {
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
      device_info: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      geo_location: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      action_timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('consent_audit_trail', ['consent_request_id', 'action_timestamp']);
    await queryInterface.addIndex('consent_audit_trail', ['action_type']);
    await queryInterface.addIndex('consent_audit_trail', ['actor_type']);

    // Create user_policy_acceptance table
    await queryInterface.createTable('user_policy_acceptance', {
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
      policy_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      policy_version: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      accepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING(2000),
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
    });

    await queryInterface.addIndex('user_policy_acceptance', ['user_id']);
    await queryInterface.addConstraint('user_policy_acceptance', {
      fields: ['user_id', 'policy_type', 'policy_version'],
      type: 'unique',
      name: 'ux_user_policy_user_version',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_policy_acceptance');
    await queryInterface.dropTable('consent_audit_trail');
    await queryInterface.dropTable('subscription_coupons');
  }
};
