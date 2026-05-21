/**
 * Subscription Coupon Model
 * 
 * Master table for subscription discount coupons
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface SubscriptionCouponAttributes {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  discountMethods: string;
  discountType: string;
  discountValue: number;
  allowedUsers?: Record<string, any> | null;
  disallowedUsers?: Record<string, any> | null;
  maxDiscountAmount?: number | null;
  minPurchaseAmount?: number | null;
  applicablePlans?: Record<string, any> | null;
  maxUses?: number | null;
  usedCount: number;
  validFrom: Date;
  validUntil?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionCoupon extends Model<SubscriptionCouponAttributes> implements SubscriptionCouponAttributes {
  declare id: string;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare discountMethods: string;
  declare discountType: string;
  declare discountValue: number;
  declare allowedUsers: Record<string, any> | null;
  declare disallowedUsers: Record<string, any> | null;
  declare maxDiscountAmount: number | null;
  declare minPurchaseAmount: number | null;
  declare applicablePlans: Record<string, any> | null;
  declare maxUses: number | null;
  declare usedCount: number;
  declare validFrom: Date;
  declare validUntil: Date | null;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

SubscriptionCoupon.init(
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
    discountMethods: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    discountType: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    allowedUsers: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of allowed user IDs',
    },
    disallowedUsers: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of disallowed user IDs',
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    minPurchaseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    applicablePlans: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of subscription plan IDs',
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  },
  {
    sequelize,
    tableName: 'subscription_coupons',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['isActive'] },
      { fields: ['validFrom', 'validUntil'] },
    ],
  }
);

export default SubscriptionCoupon;
