/**
 * Activity Log Model
 * 
 * Tracks user activities and system events for audit trail
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface ActivityLogAttributes {
  id: string;
  userId?: string | null;
  activityType: string;
  activityCategory: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export class ActivityLog extends Model<ActivityLogAttributes> implements ActivityLogAttributes {
  declare id: string;
  declare userId: string | null;
  declare activityType: string;
  declare activityCategory: string;
  declare description: string | null;
  declare metadata: Record<string, any> | null;
  declare oldValues: Record<string, any> | null;
  declare newValues: Record<string, any> | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare createdAt: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    activityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    activityCategory: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['activityType'] },
      { fields: ['createdAt'] },
      { fields: ['userId', 'activityType', 'createdAt'] },
    ],
  }
);

export default ActivityLog;
