import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface ConsentAccessLogAttributes {
  id: string;
  userId: string;
  doctorId: string;
  consentRequestId?: string | null;
  consentItemId?: string | null;
  reportId?: string | null;
  accessType: 'REPORT' | 'PROFILE_SECTION';
  accessedAt: Date;
  createdAt: Date;
}

export type ConsentAccessLogCreationAttributes = Optional<ConsentAccessLogAttributes, 'id' | 'consentRequestId' | 'consentItemId' | 'reportId' | 'createdAt'>;

export class ConsentAccessLog
  extends Model<ConsentAccessLogAttributes, ConsentAccessLogCreationAttributes>
  implements ConsentAccessLogAttributes
{
  public id!: string;
  public userId!: string;
  public doctorId!: string;
  public consentRequestId?: string | null;
  public consentItemId?: string | null;
  public reportId?: string | null;
  public accessType!: 'REPORT' | 'PROFILE_SECTION';
  public accessedAt!: Date;
  public readonly createdAt!: Date;
}

ConsentAccessLog.init(
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
      field: 'user_id',
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'doctor_id',
    },
    consentRequestId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'consent_request_id',
    },
    consentItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'consent_item_id',
    },
    reportId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'report_id',
    },
    accessType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'access_type',
    },
    accessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'accessed_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'consent_access_logs',
    timestamps: true,
    updatedAt: false,
    underscored: false,
  }
);
