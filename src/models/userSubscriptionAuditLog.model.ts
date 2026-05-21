/**
 * User Subscription Audit Log Model
 * 
 * Audit trail for subscription changes
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface UserSubscriptionAuditLogAttributes {
  id: string;
  userId: string;
  userSubscriptionId: string;
  ipAddress?: string | null;
  changeTitle: string;
  changeReason?: string | null;
  changeDetails?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  action: string;
  extraInfo?: Record<string, any> | null;
  createdAt: Date;
}

export class UserSubscriptionAuditLog extends Model<UserSubscriptionAuditLogAttributes> implements UserSubscriptionAuditLogAttributes {
  declare id: string;
  declare userId: string;
  declare userSubscriptionId: string;
  declare ipAddress: string | null;
  declare changeTitle: string;
  declare changeReason: string | null;
  declare changeDetails: string | null;
  declare oldValue: string | null;
  declare newValue: string | null;
  declare action: string;
  declare extraInfo: Record<string, any> | null;
  declare createdAt: Date;
}

UserSubscriptionAuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    userSubscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user_subscriptions', key: 'id' },
      onDelete: 'SET NULL',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    changeTitle: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    changeReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changeDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    extraInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Change source, trigger, payment details, discount info',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_subscription_audit_logs',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['userSubscriptionId'] },
      { fields: ['action'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default UserSubscriptionAuditLog;
