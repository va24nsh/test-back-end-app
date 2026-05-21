'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drug_library', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      drug_name: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      generic_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      drug_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      dosage_form: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      strength: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      brand_names: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      brand_metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      extra_info: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      is_prescription_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('drug_library', ['drug_name']);
    await queryInterface.addIndex('drug_library', ['generic_name']);
    await queryInterface.addIndex('drug_library', ['is_active']);
    await queryInterface.addIndex('drug_library', ['brand_names'], {
      using: 'gin',
      type: 'GIN',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('drug_library');
  }
};
