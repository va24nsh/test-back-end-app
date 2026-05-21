'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove updatedAt from notifications (immutable table) - if it exists
    try {
      await queryInterface.removeColumn('notifications', 'updated_at');
    } catch (error) {
      console.warn('updated_at column may not exist in notifications table - table is already immutable');
    }

    // Add metadata to nudges if not already present
    try {
      await queryInterface.addColumn('nudges', 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.warn('metadata column may already exist in nudges table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('nudges', 'metadata');
    } catch (error) {
      console.warn('metadata column may not exist in nudges table');
    }
    
    try {
      await queryInterface.addColumn('notifications', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.warn('updated_at column may not be added to notifications');
    }
  }
};
