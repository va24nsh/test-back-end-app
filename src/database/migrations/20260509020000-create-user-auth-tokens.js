'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_auth_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      refresh_token_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      token_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Bearer',
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      device_info: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      refresh_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      session_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rotated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      replaced_by_token_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      token_family_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_auth_tokens');
  },
};
