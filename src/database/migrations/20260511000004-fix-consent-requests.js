'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make doctorId nullable (without FK in changeColumn)
    try {
      await queryInterface.changeColumn('consent_requests', 'doctor_id', {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('doctor_id change may have failed, may already be nullable');
    }

    // Make requestScope NOT NULL if not already
    try {
      await queryInterface.changeColumn('consent_requests', 'request_scope', {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      });
    } catch (error) {
      console.warn('request_scope change may have failed');
    }

    // Make consentTextCare NOT NULL if not already
    try {
      await queryInterface.changeColumn('consent_requests', 'consent_text_care', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
      });
    } catch (error) {
      console.warn('consent_text_care change may have failed');
    }

    // Add missing audit fields
    try {
      await queryInterface.addColumn('consent_requests', 'user_consent_ip', {
        type: Sequelize.STRING(45),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('user_consent_ip column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_requests', 'user_consent_device', {
        type: Sequelize.STRING(200),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('user_consent_device column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_requests', 'user_consent_geo', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('user_consent_geo column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_requests', 'revocation_reason', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('revocation_reason column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_requests', 'revocation_ip', {
        type: Sequelize.STRING(45),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('revocation_ip column may already exist');
    }

    try {
      await queryInterface.addIndex('consent_requests', ['user_consent_timestamp']);
    } catch (error) {
      console.warn('user_consent_timestamp index may already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('consent_requests', ['user_consent_timestamp']);
    } catch (error) {
      console.warn('user_consent_timestamp index may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_requests', 'revocation_ip');
    } catch (error) {
      console.warn('revocation_ip column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_requests', 'revocation_reason');
    } catch (error) {
      console.warn('revocation_reason column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_requests', 'user_consent_geo');
    } catch (error) {
      console.warn('user_consent_geo column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_requests', 'user_consent_device');
    } catch (error) {
      console.warn('user_consent_device column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_requests', 'user_consent_ip');
    } catch (error) {
      console.warn('user_consent_ip column may not exist');
    }
  }
};
