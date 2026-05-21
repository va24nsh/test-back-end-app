'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('visits', {
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
      visit_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      visit_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      visit_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'doctors', key: 'id' },
        onDelete: 'SET NULL',
      },
      doctor_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      referred_by_doctor_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      clinic_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      chief_complaint: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      medicines: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      prescription_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      vital_signs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      consultancy_duration: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      is_followup_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      follow_up_date: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('visits', ['user_id']);
    await queryInterface.addIndex('visits', ['visit_date']);
    await queryInterface.addIndex('visits', ['user_id', 'visit_date']);
    await queryInterface.addIndex('visits', ['doctor_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('visits');
  }
};
