'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
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
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      doctor_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      doctor_specialization: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      doctor_hospital: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      doctor_fees: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      patient_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      patient_phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      patient_gender: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      patient_age: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      time_slot: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'UPCOMING',
      },
      cancelled_at: {
        type: Sequelize.DATE,
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

    // Individual indexes for common query patterns
    await queryInterface.addIndex('appointments', ['user_id'], { name: 'idx_appointments_user_id' });
    await queryInterface.addIndex('appointments', ['doctor_id'], { name: 'idx_appointments_doctor_id' });
    await queryInterface.addIndex('appointments', ['date'], { name: 'idx_appointments_date' });
    await queryInterface.addIndex('appointments', ['status'], { name: 'idx_appointments_status' });

    // Composite unique index to enforce one appointment per doctor per slot
    await queryInterface.addIndex('appointments', ['doctor_id', 'date', 'time_slot'], {
      name: 'ux_appointments_doctor_date_slot',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('appointments', 'ux_appointments_doctor_date_slot');
    await queryInterface.removeIndex('appointments', 'idx_appointments_status');
    await queryInterface.removeIndex('appointments', 'idx_appointments_date');
    await queryInterface.removeIndex('appointments', 'idx_appointments_doctor_id');
    await queryInterface.removeIndex('appointments', 'idx_appointments_user_id');
    await queryInterface.dropTable('appointments');
  },
};
