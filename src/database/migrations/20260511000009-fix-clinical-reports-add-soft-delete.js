'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add soft delete column to clinical_reports
    await queryInterface.addColumn('clinical_reports', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Soft delete timestamp'
    });

    // Add index on deleted_at
    await queryInterface.addIndex('clinical_reports', ['deleted_at'], {
      name: 'idx_clinical_reports_deleted_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('clinical_reports', 'idx_clinical_reports_deleted_at');
    await queryInterface.removeColumn('clinical_reports', 'deleted_at');
  }
};
