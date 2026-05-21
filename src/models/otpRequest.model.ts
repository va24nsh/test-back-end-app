import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type OtpRequestStatus = 'SENT' | 'VERIFIED' | 'FAILED' | 'EXPIRED';

export interface OtpRequestAttributes {
  id: string;
  phoneNumber: string;
  userId?: string | null;
  provider: string;
  providerRequestId?: string | null;
  providerMessageId?: string | null;
  status: OtpRequestStatus;
  attempts: number;
  expiresAt: Date;
  verifiedAt?: Date | null;
  lastAttemptAt?: Date | null;
  ipAddress?: string | null;
  deviceId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type OtpRequestCreationAttributes = Optional<
  OtpRequestAttributes,
  | 'id'
  | 'userId'
  | 'provider'
  | 'providerRequestId'
  | 'providerMessageId'
  | 'status'
  | 'attempts'
  | 'verifiedAt'
  | 'lastAttemptAt'
  | 'ipAddress'
  | 'deviceId'
  | 'metadata'
  | 'createdAt'
  | 'updatedAt'
>;

export class OtpRequest
  extends Model<OtpRequestAttributes, OtpRequestCreationAttributes>
  implements OtpRequestAttributes
{
  public id!: string;
  public phoneNumber!: string;
  public userId?: string | null;
  public provider!: string;
  public providerRequestId?: string | null;
  public providerMessageId?: string | null;
  public status!: OtpRequestStatus;
  public attempts!: number;
  public expiresAt!: Date;
  public verifiedAt?: Date | null;
  public lastAttemptAt?: Date | null;
  public ipAddress?: string | null;
  public deviceId?: string | null;
  public metadata!: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OtpRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'phone_number',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'MSG91',
    },
    providerRequestId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'provider_request_id',
    },
    providerMessageId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'provider_message_id',
    },
    status: {
      type: DataTypes.ENUM('SENT', 'VERIFIED', 'FAILED', 'EXPIRED'),
      allowNull: false,
      defaultValue: 'SENT',
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verified_at',
    },
    lastAttemptAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_attempt_at',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'device_id',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
    tableName: 'otp_requests',
    timestamps: true,
    underscored: false,
  }
);
