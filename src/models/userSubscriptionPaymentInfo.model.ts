/**
 * User Subscription Payment Info Model
 * 
 * Store payment information for subscriptions
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface UserSubscriptionPaymentInfoAttributes {
  id: string;
  userId: string;
  paymentMethod: string;
  paymentProvider?: string | null;
  paymentProviderId?: string | null;
  cardLastFour?: string | null;
  cardBrand?: string | null;
  billingAddress?: Record<string, any> | null;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserSubscriptionPaymentInfo extends Model<UserSubscriptionPaymentInfoAttributes> implements UserSubscriptionPaymentInfoAttributes {
  declare id: string;
  declare userId: string;
  declare paymentMethod: string;
  declare paymentProvider: string | null;
  declare paymentProviderId: string | null;
  declare cardLastFour: string | null;
  declare cardBrand: string | null;
  declare billingAddress: Record<string, any> | null;
  declare currency: string;
  declare isDefault: boolean;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserSubscriptionPaymentInfo.init(
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
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentProvider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentProviderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cardLastFour: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    cardBrand: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    billingAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'user_subscription_payment_info',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
    ],
  }
);

export default UserSubscriptionPaymentInfo;
