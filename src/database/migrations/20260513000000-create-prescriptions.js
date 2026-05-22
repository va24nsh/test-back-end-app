'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prescriptions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      visit_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      doctor_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      doctor_speciality: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      clinic: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      diagnosis: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
      },
      complaints: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      tests: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      advice: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      medicines: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      follow_up_notes: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      follow_up_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      prescription_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deleted_by: {
        type: Sequelize.UUID,
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

    // Index on patient_id for patient-scoped queries
    await queryInterface.addIndex('prescriptions', ['patient_id'], {
      name: 'idx_prescriptions_patient_id',
    });

    // Index on status for filtered queries
    await queryInterface.addIndex('prescriptions', ['status'], {
      name: 'idx_prescriptions_status',
    });

    // Composite index on patient_id and is_deleted for optimized list queries
    await queryInterface.addIndex('prescriptions', ['patient_id', 'is_deleted'], {
      name: 'idx_prescriptions_patient_not_deleted',
    });

    // Index on prescription_date for sort performance
    await queryInterface.addIndex('prescriptions', ['prescription_date'], {
      name: 'idx_prescriptions_prescription_date',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('prescriptions', 'idx_prescriptions_prescription_date');
    await queryInterface.removeIndex('prescriptions', 'idx_prescriptions_patient_not_deleted');
    await queryInterface.removeIndex('prescriptions', 'idx_prescriptions_status');
    await queryInterface.removeIndex('prescriptions', 'idx_prescriptions_patient_id');
    await queryInterface.dropTable('prescriptions');
  },
};
