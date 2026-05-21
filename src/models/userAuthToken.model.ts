import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface UserAuthTokenAttributes {
  id: string;
  userId: string;
  refreshTokenHash: string;
  tokenType: string;
  deviceId: string;
  deviceInfo?: Record<string, unknown> | null;
  ipAddress?: string | null;
  refreshExpiresAt: Date;
  sessionExpiresAt: Date;
  lastUsedAt?: Date | null;
  rotatedAt?: Date | null;
  replacedByTokenId?: string | null;
  tokenFamilyId?: string | null;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserAuthTokenCreationAttributes = Optional<
  UserAuthTokenAttributes,
  | 'id'
  | 'tokenType'
  | 'deviceInfo'
  | 'ipAddress'
  | 'lastUsedAt'
  | 'rotatedAt'
  | 'replacedByTokenId'
  | 'tokenFamilyId'
  | 'revokedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export class UserAuthToken
  extends Model<UserAuthTokenAttributes, UserAuthTokenCreationAttributes>
  implements UserAuthTokenAttributes
{
  public id!: string;
  public userId!: string;
  public refreshTokenHash!: string;
  public tokenType!: string;
  public deviceId!: string;
  public deviceInfo?: Record<string, unknown> | null;
  public ipAddress?: string | null;
  public refreshExpiresAt!: Date;
  public sessionExpiresAt!: Date;
  public lastUsedAt?: Date | null;
  public rotatedAt?: Date | null;
  public replacedByTokenId?: string | null;
  public tokenFamilyId?: string | null;
  public revokedAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserAuthToken.init(
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
    refreshTokenHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: 'refresh_token_hash',
    },
    tokenType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Bearer',
      field: 'token_type',
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'device_id',
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'device_info',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    refreshExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'refresh_expires_at',
    },
    sessionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'session_expires_at',
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_used_at',
    },
    rotatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'rotated_at',
    },
    replacedByTokenId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'replaced_by_token_id',
    },
    tokenFamilyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'token_family_id',
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'revoked_at',
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
    tableName: 'user_auth_tokens',
    timestamps: true,
    underscored: false,
  }
);
