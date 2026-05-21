'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make consent_training nullable (if it exists)
    try {
      await queryInterface.changeColumn('consent_text_versions', 'consent_training', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      // Column might not exist in all environments
      console.warn('consent_training column may not exist, skipping change');
    }

    // Add missing fields
    try {
      await queryInterface.addColumn('consent_text_versions', 'effective_from', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.warn('effective_from column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_text_versions', 'effective_until', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('effective_until column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_text_versions', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.warn('created_by column may already exist');
    }

    try {
      await queryInterface.addColumn('consent_text_versions', 'change_reason', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('change_reason column may already exist');
    }

    try {
      await queryInterface.addIndex('consent_text_versions', ['effective_from']);
    } catch (error) {
      console.warn('effective_from index may already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('consent_text_versions', ['effective_from']);
    } catch (error) {
      console.warn('effective_from index may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_text_versions', 'change_reason');
    } catch (error) {
      console.warn('change_reason column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_text_versions', 'created_by');
    } catch (error) {
      console.warn('created_by column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_text_versions', 'effective_until');
    } catch (error) {
      console.warn('effective_until column may not exist');
    }
    
    try {
      await queryInterface.removeColumn('consent_text_versions', 'effective_from');
    } catch (error) {
      console.warn('effective_from column may not exist');
    }
  }
};
