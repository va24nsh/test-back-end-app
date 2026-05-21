import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface UserProfileAttributes {
  id: string;
  userId: string;
  dateOfBirth?: Date | null;
  bloodType?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
  medicalHistory?: Record<string, unknown> | unknown[] | null;
  familyHistory?: Record<string, unknown> | unknown[] | null;
  currentMedications?: Record<string, unknown> | unknown[] | null;
  allergies?: Record<string, unknown> | unknown[] | null;
  geneticTesting?: Record<string, unknown> | unknown[] | null;
  environmentalFactors?: Record<string, unknown> | unknown[] | null;
  reproductiveHistory?: Record<string, unknown> | unknown[] | null;
  lifestyle?: Record<string, unknown> | unknown[] | null;
  stepsCompleted: Record<string, boolean>;
  profileCompletionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserProfileCreationAttributes = Optional<
  UserProfileAttributes,
  | 'id'
  | 'dateOfBirth'
  | 'bloodType'
  | 'heightCm'
  | 'weightKg'
  | 'emergencyContactName'
  | 'emergencyContactRelationship'
  | 'emergencyContactPhone'
  | 'emergencyContactEmail'
  | 'medicalHistory'
  | 'familyHistory'
  | 'currentMedications'
  | 'allergies'
  | 'geneticTesting'
  | 'environmentalFactors'
  | 'reproductiveHistory'
  | 'lifestyle'
  | 'stepsCompleted'
  | 'profileCompletionPercentage'
  | 'createdAt'
  | 'updatedAt'
>;

export class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public id!: string;
  public userId!: string;
  public dateOfBirth?: Date | null;
  public bloodType?: string | null;
  public heightCm?: number | null;
  public weightKg?: number | null;
  public emergencyContactName?: string | null;
  public emergencyContactRelationship?: string | null;
  public emergencyContactPhone?: string | null;
  public emergencyContactEmail?: string | null;
  public medicalHistory?: Record<string, unknown> | unknown[] | null;
  public familyHistory?: Record<string, unknown> | unknown[] | null;
  public currentMedications?: Record<string, unknown> | unknown[] | null;
  public allergies?: Record<string, unknown> | unknown[] | null;
  public geneticTesting?: Record<string, unknown> | unknown[] | null;
  public environmentalFactors?: Record<string, unknown> | unknown[] | null;
  public reproductiveHistory?: Record<string, unknown> | unknown[] | null;
  public lifestyle?: Record<string, unknown> | unknown[] | null;
  public stepsCompleted!: Record<string, boolean>;
  public profileCompletionPercentage!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_of_birth',
    },
    bloodType: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'blood_type',
    },
    heightCm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'height_cm',
    },
    weightKg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'weight_kg',
    },
    emergencyContactName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'emergency_contact_name',
    },
    emergencyContactRelationship: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'emergency_contact_relationship',
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'emergency_contact_phone',
    },
    emergencyContactEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'emergency_contact_email',
    },
    medicalHistory: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'medical_history',
    },
    familyHistory: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'family_history',
    },
    currentMedications: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'current_medications',
    },
    allergies: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'allergies',
    },
    geneticTesting: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'genetic_testing',
    },
    environmentalFactors: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'environmental_factors',
    },
    reproductiveHistory: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'reproductive_history',
    },
    lifestyle: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'lifestyle',
    },
    stepsCompleted: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'steps_completed',
    },
    profileCompletionPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'profile_completion_percentage',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'user_profiles',
    timestamps: true,
    underscored: false,
  }
);
