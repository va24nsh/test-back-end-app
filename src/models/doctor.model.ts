import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface DoctorAttributes {
  id: string;
  externalDoctorId?: string | null;
  firstName: string;
  lastName: string;
  specialization?: string | null;
  hospitalName?: string | null;
  profilePicture?: string | null;
  status: DoctorStatus;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DoctorCreationAttributes = Optional<DoctorAttributes, 'id' | 'externalDoctorId' | 'specialization' | 'hospitalName' | 'profilePicture' | 'status' | 'isVerified' | 'createdAt' | 'updatedAt'>;

export class Doctor extends Model<DoctorAttributes, DoctorCreationAttributes> implements DoctorAttributes {
  public id!: string;
  public externalDoctorId?: string | null;
  public firstName!: string;
  public lastName!: string;
  public specialization?: string | null;
  public hospitalName?: string | null;
  public profilePicture?: string | null;
  public status!: DoctorStatus;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Doctor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    externalDoctorId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'external_doctor_id',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
    },
    specialization: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    hospitalName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'hospital_name',
    },
    profilePicture: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'profile_picture',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_verified',
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
    tableName: 'doctors',
    timestamps: true,
    underscored: false,
  }
);
