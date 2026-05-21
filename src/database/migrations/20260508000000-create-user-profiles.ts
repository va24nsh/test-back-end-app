import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('user_profiles', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    blood_type: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    height_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    emergency_contact_relationship: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergency_contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    medical_history: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    family_history: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    current_medications: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    allergies: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    genetic_testing: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    environmental_factors: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    reproductive_history: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    lifestyle: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    steps_completed: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    profile_completion_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('user_profiles');
}
