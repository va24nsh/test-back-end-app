/**
 * Subscription Model
 * 
 * Master table for subscription plans
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface SubscriptionAttributes {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  priceCurrency: string;
  trialPeriodDays: number;
  gracePeriodDays: number;
  isDefaultPlan: boolean;
  isActive: boolean;
  isPublic: boolean;
  extraInfo?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Subscription extends Model<SubscriptionAttributes> implements SubscriptionAttributes {
  declare id: string;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare monthlyPrice: number;
  declare yearlyPrice: number;
  declare priceCurrency: string;
  declare trialPeriodDays: number;
  declare gracePeriodDays: number;
  declare isDefaultPlan: boolean;
  declare isActive: boolean;
  declare isPublic: boolean;
  declare extraInfo: Record<string, any> | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    monthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    yearlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    priceCurrency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    trialPeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    gracePeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isDefaultPlan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    extraInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Features, limits, storage_gb, etc.',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['isActive'] },
      { fields: ['isPublic'] },
    ],
  }
);

export default Subscription;
