import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type ConsentItemType = 'REPORT' | 'PROFILE_SECTION';
export type ConsentItemStatus = 'APPROVED' | 'REVOKED';

export interface ConsentItemAttributes {
  id: string;
  consentRequestId: string;
  doctorId: string;
  externalDoctorId?: string | null;
  userId: string;
  itemType: ConsentItemType;
  itemId: string;
  reportType?: string | null;
  status: ConsentItemStatus;
  approvedAt?: Date | null;
  revokedAt?: Date | null;
  approvedBy?: string | null;
  revokedBy?: string | null;
  careProcessingConsent: boolean;
  trainingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsentItemCreationAttributes = Optional<ConsentItemAttributes, 'id' | 'externalDoctorId' | 'reportType' | 'approvedAt' | 'revokedAt' | 'approvedBy' | 'revokedBy' | 'createdAt' | 'updatedAt'>;

export class ConsentItem extends Model<ConsentItemAttributes, ConsentItemCreationAttributes> implements ConsentItemAttributes {
  public id!: string;
  public consentRequestId!: string;
  public doctorId!: string;
  public externalDoctorId?: string | null;
  public userId!: string;
  public itemType!: ConsentItemType;
  public itemId!: string;
  public reportType?: string | null;
  public status!: ConsentItemStatus;
  public approvedAt?: Date | null;
  public revokedAt?: Date | null;
  public approvedBy?: string | null;
  public revokedBy?: string | null;
  public careProcessingConsent!: boolean;
  public trainingConsent!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsentItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    consentRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consent_request_id',
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'doctor_id',
    },
    externalDoctorId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'external_doctor_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    itemType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'item_type',
    },
    itemId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'item_id',
    },
    reportType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'report_type',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'APPROVED',
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at',
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'revoked_at',
    },
    approvedBy: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'approved_by',
    },
    revokedBy: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'revoked_by',
    },
    careProcessingConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'care_processing_consent',
    },
    trainingConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'training_consent',
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
    tableName: 'consent_items',
    timestamps: true,
    underscored: false,
  }
);
