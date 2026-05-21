import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface OtpAttemptAttributes {
  id: string;
  phoneNumber: string;
  attemptCount: number;
  blockedUntil?: Date | null;
  lastAttemptAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type OtpAttemptCreationAttributes = Optional<
  OtpAttemptAttributes,
  'id' | 'attemptCount' | 'blockedUntil' | 'lastAttemptAt' | 'createdAt' | 'updatedAt'
>;

export class OtpAttempt
  extends Model<OtpAttemptAttributes, OtpAttemptCreationAttributes>
  implements OtpAttemptAttributes
{
  public id!: string;
  public phoneNumber!: string;
  public attemptCount!: number;
  public blockedUntil?: Date | null;
  public lastAttemptAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OtpAttempt.init(
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
      unique: true,
      field: 'phone_number',
    },
    attemptCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'attempt_count',
    },
    blockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'blocked_until',
    },
    lastAttemptAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_attempt_at',
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
    tableName: 'otp_attempts',
    timestamps: true,
    underscored: false,
  }
);
