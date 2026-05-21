/**
 * User Subscription Invoice Model
 * 
 * Store subscription invoices and payment history
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface UserSubscriptionInvoiceAttributes {
  id: string;
  userSubscriptionId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  status: string;
  term: string;
  isManualPayment: boolean;
  amount: number;
  currency: string;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidVia?: string | null;
  paymentDate?: Date | null;
  transactionId?: string | null;
  dueDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  paymentProviderId?: string | null;
  invoiceUrl?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserSubscriptionInvoice extends Model<UserSubscriptionInvoiceAttributes> implements UserSubscriptionInvoiceAttributes {
  declare id: string;
  declare userSubscriptionId: string;
  declare invoiceNumber: string;
  declare invoiceDate: Date;
  declare status: string;
  declare term: string;
  declare isManualPayment: boolean;
  declare amount: number;
  declare currency: string;
  declare taxAmount: number;
  declare discountAmount: number;
  declare totalAmount: number;
  declare paidVia: string | null;
  declare paymentDate: Date | null;
  declare transactionId: string | null;
  declare dueDate: Date;
  declare billingPeriodStart: Date;
  declare billingPeriodEnd: Date;
  declare paymentProviderId: string | null;
  declare invoiceUrl: string | null;
  declare notes: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserSubscriptionInvoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userSubscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'user_subscriptions', key: 'id' },
      onDelete: 'CASCADE',
    },
    invoiceNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'unpaid',
    },
    term: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    isManualPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paidVia: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    billingPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    billingPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paymentProviderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    invoiceUrl: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'user_subscription_invoices',
    timestamps: true,
    indexes: [
      { fields: ['userSubscriptionId'] },
      { fields: ['invoiceNumber'], unique: true },
      { fields: ['status'] },
      { fields: ['dueDate'] },
    ],
  }
);

export default UserSubscriptionInvoice;
