'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clinical_report_analytics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      clinical_report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'clinical_reports',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      extracted_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      key_findings: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      normal_ranges: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      abnormal_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      key_findings_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      recommendations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      risk_level: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      analysis_model_version: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      analysis_date: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable('clinical_report_analytics');
  },
};
