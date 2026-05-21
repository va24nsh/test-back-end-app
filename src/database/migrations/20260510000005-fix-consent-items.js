'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make doctorId nullable (without FK in changeColumn)
    try {
      await queryInterface.changeColumn('consent_items', 'doctor_id', {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('doctor_id change may have failed');
    }

    // Make approvedAt NOT NULL
    try {
      await queryInterface.changeColumn('consent_items', 'approved_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.warn('approved_at change may have failed');
    }

    // Make approvedBy NOT NULL (ENUM: USER, SYSTEM)
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE consent_items 
        ALTER COLUMN approved_by SET NOT NULL;
      `);
    } catch (error) {
      console.warn('approved_by change may have failed');
    }

    // Add missing audit fields
    try {
      await queryInterface.addColumn('consent_items', 'approved_ip', {
        type: Sequelize.STRING(45),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('approved_ip column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_items', 'approved_device', {
        type: Sequelize.STRING(200),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('approved_device column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_items', 'approved_geo', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('approved_geo column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_items', 'revocation_reason', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('revocation_reason column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_items', 'revocation_ip', {
        type: Sequelize.STRING(45),
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('revocation_ip column may already exist');
    }

    // Add UNIQUE constraint on (user_id, doctor_id, item_type, item_id)
    try {
      await queryInterface.addConstraint('consent_items', {
        fields: ['user_id', 'doctor_id', 'item_type', 'item_id'],
        type: 'unique',
        name: 'ux_consent_items_user_doctor_item'
      });
    } catch (error) {
      console.warn('ux_consent_items_user_doctor_item constraint may already exist');
    }

    // Add indexes
    try {
      await queryInterface.addIndex('consent_items', ['approved_at']);
    } catch (error) {
      console.warn('approved_at index may already exist');
    }

    try {
      await queryInterface.addIndex('consent_items', ['revoked_at']);
    } catch (error) {
      console.warn('revoked_at index may already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('consent_items', ['revoked_at']);
    } catch (error) {
      console.warn('revoked_at index may not exist');
    }
    
    try {
      await queryInterface.removeIndex('consent_items', ['approved_at']);
    } catch (error) {
      console.warn('approved_at index may not exist');
    }
    
    try {
      await queryInterface.removeConstraint('consent_items', 'ux_consent_items_user_doctor_item');
    } catch (error) {
      console.warn('ux_consent_items_user_doctor_item constraint may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_items', 'revocation_ip');
    } catch (error) {
      console.warn('revocation_ip column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_items', 'revocation_reason');
    } catch (error) {
      console.warn('revocation_reason column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_items', 'approved_geo');
    } catch (error) {
      console.warn('approved_geo column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_items', 'approved_device');
    } catch (error) {
      console.warn('approved_device column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_items', 'approved_ip');
    } catch (error) {
      console.warn('approved_ip column may not exist');
    }
  }
};
