'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clinical_reports', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      report_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      report_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      uploaded_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING(2000),
        allowNull: false,
      },
      file_size_bytes: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      file_mime_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      lab_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      doctor_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      is_analyzed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      analysis_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('clinical_reports', ['user_id'], {
      name: 'idx_clinical_reports_user_id',
    });
    await queryInterface.addIndex('clinical_reports', ['report_type'], {
      name: 'idx_clinical_reports_report_type',
    });
    await queryInterface.addIndex('clinical_reports', ['report_date'], {
      name: 'idx_clinical_reports_report_date',
    });
    await queryInterface.addIndex('clinical_reports', ['is_analyzed'], {
      name: 'idx_clinical_reports_is_analyzed',
    });

    await queryInterface.createTable('clinical_report_analytics', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
        allowNull: false,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('clinical_report_analytics', ['clinical_report_id'], {
      name: 'idx_clinical_report_analytics_report_id',
    });
    await queryInterface.addIndex('clinical_report_analytics', ['risk_level'], {
      name: 'idx_clinical_report_analytics_risk_level',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('clinical_report_analytics');
    await queryInterface.dropTable('clinical_reports');
  },
};
