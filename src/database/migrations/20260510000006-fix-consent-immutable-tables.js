'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove updatedAt from consent_item_timeline (immutable audit table)
    try {
      await queryInterface.removeColumn('consent_item_timeline', 'updated_at');
    } catch (error) {
      console.warn('updated_at removal from consent_item_timeline may have failed');
    }

    // Remove updatedAt from consent_access_logs (immutable audit table)
    try {
      await queryInterface.removeColumn('consent_access_logs', 'updated_at');
    } catch (error) {
      console.warn('updated_at removal from consent_access_logs may have failed');
    }

    // Add missing fields to consent_access_logs
    try {
      await queryInterface.addColumn('consent_access_logs', 'external_doctor_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('external_doctor_id column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_access_logs', 'profile_section', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('profile_section column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_access_logs', 'access_purpose', {
        type: Sequelize.STRING(200),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('access_purpose column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_access_logs', 'user_agent', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('user_agent column may already exist');
    }

    // Make doctorId nullable (without FK in changeColumn)
    try {
      await queryInterface.changeColumn('consent_access_logs', 'doctor_id', {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('doctor_id change may have failed');
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('consent_access_logs', 'user_agent');
    } catch (error) {
      console.warn('user_agent column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_access_logs', 'access_purpose');
    } catch (error) {
      console.warn('access_purpose column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_access_logs', 'profile_section');
    } catch (error) {
      console.warn('profile_section column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_access_logs', 'external_doctor_id');
    } catch (error) {
      console.warn('external_doctor_id column may not exist');
    }
    
    try {
      await queryInterface.addColumn('consent_access_logs', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.warn('updated_at column may not be added to consent_access_logs');
    }
    
    try {
      await queryInterface.addColumn('consent_item_timeline', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.warn('updated_at column may not be added to consent_item_timeline');
    }
  }
};
