/**
 * User Subscription Model
 * 
 * User subscription records and status
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface UserSubscriptionAttributes {
  id: string;
  userId: string;
  subscriptionId: string;
  status: string;
  term: string;
  type: string;
  freemiumStartDate?: Date | null;
  freemiumEndDate?: Date | null;
  startDate: Date;
  endDate?: Date | null;
  nextBillingDate?: Date | null;
  isManualPayment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserSubscription extends Model<UserSubscriptionAttributes> implements UserSubscriptionAttributes {
  declare id: string;
  declare userId: string;
  declare subscriptionId: string;
  declare status: string;
  declare term: string;
  declare type: string;
  declare freemiumStartDate: Date | null;
  declare freemiumEndDate: Date | null;
  declare startDate: Date;
  declare endDate: Date | null;
  declare nextBillingDate: Date | null;
  declare isManualPayment: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserSubscription.init(
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
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'subscriptions', key: 'id' },
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'CANCEL', 'HOLD', 'DEACTIVATED', 'EXPIRED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    term: {
      type: DataTypes.ENUM('MONTHLY', 'YEARLY'),
      allowNull: false,
      defaultValue: 'MONTHLY',
    },
    type: {
      type: DataTypes.ENUM('PAID', 'FREEMIUM'),
      allowNull: false,
      defaultValue: 'PAID',
    },
    freemiumStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    freemiumEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isManualPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'user_subscriptions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['userId', 'status'] },
      { fields: ['nextBillingDate'] },
    ],
  }
);

export default UserSubscription;
