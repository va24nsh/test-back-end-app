'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctors', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      external_doctor_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      specialization: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      hospital_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.STRING(2000),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('doctors', ['status'], { name: 'idx_doctors_status' });
    await queryInterface.addIndex('doctors', ['first_name'], { name: 'idx_doctors_first_name' });
    await queryInterface.addIndex('doctors', ['last_name'], { name: 'idx_doctors_last_name' });
    await queryInterface.addIndex('doctors', ['specialization'], { name: 'idx_doctors_specialization' });
    await queryInterface.addIndex('doctors', ['hospital_name'], { name: 'idx_doctors_hospital_name' });

    await queryInterface.createTable('consent_text_versions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      consent_care: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      consent_training: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.createTable('consent_requests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      external_doctor_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
      source: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      requested_access_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      request_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      request_scope: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      request_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      granted_scope: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      care_processing_consent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      training_consent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      consent_text_version_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'consent_text_versions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      consent_text_version: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      consent_text_care: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      consent_text_training: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_consent_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revoked_by: {
        type: Sequelize.STRING(20),
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

    await queryInterface.addIndex('consent_requests', ['user_id'], { name: 'idx_consent_requests_user_id' });
    await queryInterface.addIndex('consent_requests', ['doctor_id'], { name: 'idx_consent_requests_doctor_id' });
    await queryInterface.addIndex('consent_requests', ['status'], { name: 'idx_consent_requests_status' });
    await queryInterface.addIndex('consent_requests', ['user_id', 'status'], { name: 'idx_consent_requests_user_status' });
    await queryInterface.addIndex('consent_requests', ['user_id', 'doctor_id'], { name: 'idx_consent_requests_user_doctor' });
    await queryInterface.addIndex('consent_requests', ['user_consent_timestamp'], { name: 'idx_consent_requests_user_consent_timestamp' });

    await queryInterface.createTable('consent_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      consent_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'consent_requests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      external_doctor_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
      item_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      item_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      report_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'APPROVED',
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approved_by: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      revoked_by: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      care_processing_consent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      training_consent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('consent_items', ['user_id', 'doctor_id', 'item_type', 'item_id'], {
      name: 'ux_consent_items_user_doctor_item',
      unique: true,
    });
    await queryInterface.addIndex('consent_items', ['consent_request_id'], { name: 'idx_consent_items_request_id' });
    await queryInterface.addIndex('consent_items', ['user_id', 'doctor_id'], { name: 'idx_consent_items_user_doctor' });
    await queryInterface.addIndex('consent_items', ['doctor_id', 'item_type', 'item_id'], { name: 'idx_consent_items_doctor_item' });
    await queryInterface.addIndex('consent_items', ['report_type'], { name: 'idx_consent_items_report_type' });
    await queryInterface.addIndex('consent_items', ['status'], { name: 'idx_consent_items_status' });
    await queryInterface.addIndex('consent_items', ['approved_at'], { name: 'idx_consent_items_approved_at' });
    await queryInterface.addIndex('consent_items', ['revoked_at'], { name: 'idx_consent_items_revoked_at' });

    await queryInterface.createTable('consent_item_timeline', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      consent_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'consent_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      consent_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'consent_requests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      event_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      actor_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      actor_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      old_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      new_status: {
        type: Sequelize.STRING(50),
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
      device_info: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      geo_location: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      event_timestamp: {
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

    await queryInterface.addIndex('consent_item_timeline', ['consent_item_id', 'event_timestamp'], {
      name: 'idx_consent_item_timeline_item_time',
    });
    await queryInterface.addIndex('consent_item_timeline', ['consent_request_id'], {
      name: 'idx_consent_item_timeline_request_id',
    });
    await queryInterface.addIndex('consent_item_timeline', ['event_type'], {
      name: 'idx_consent_item_timeline_event_type',
    });

    await queryInterface.createTable('consent_access_logs', {
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
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      consent_request_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'consent_requests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      consent_item_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'consent_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'clinical_reports',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      access_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      accessed_at: {
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

    await queryInterface.addIndex('consent_access_logs', ['user_id'], { name: 'idx_consent_access_logs_user_id' });
    await queryInterface.addIndex('consent_access_logs', ['doctor_id'], { name: 'idx_consent_access_logs_doctor_id' });
    await queryInterface.addIndex('consent_access_logs', ['consent_item_id'], { name: 'idx_consent_access_logs_item_id' });
    await queryInterface.addIndex('consent_access_logs', ['report_id'], { name: 'idx_consent_access_logs_report_id' });
    await queryInterface.addIndex('consent_access_logs', ['accessed_at'], { name: 'idx_consent_access_logs_accessed_at' });
    await queryInterface.addIndex('consent_access_logs', ['doctor_id', 'accessed_at'], { name: 'idx_consent_access_logs_doctor_accessed_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('consent_access_logs');
    await queryInterface.dropTable('consent_item_timeline');
    await queryInterface.dropTable('consent_items');
    await queryInterface.dropTable('consent_requests');
    await queryInterface.dropTable('consent_text_versions');
    await queryInterface.dropTable('doctors');
  },
};
