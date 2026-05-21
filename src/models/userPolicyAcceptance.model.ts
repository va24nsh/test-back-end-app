/**
 * User Policy Acceptance Model
 * 
 * Track user acceptance of policies and terms
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface UserPolicyAcceptanceAttributes {
  id: string;
  userId: string;
  policyType: string;
  policyVersion: string;
  accepted: boolean;
  acceptedAt: Date;
  name: string;
  description?: string | null;
  url?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export class UserPolicyAcceptance extends Model<UserPolicyAcceptanceAttributes> implements UserPolicyAcceptanceAttributes {
  declare id: string;
  declare userId: string;
  declare policyType: string;
  declare policyVersion: string;
  declare accepted: boolean;
  declare acceptedAt: Date;
  declare name: string;
  declare description: string | null;
  declare url: string | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare createdAt: Date;
}

UserPolicyAcceptance.init(
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
    policyType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    policyVersion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(2000),
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
    tableName: 'user_policy_acceptance',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['userId', 'policyType', 'policyVersion'], unique: true },
    ],
  }
);

export default UserPolicyAcceptance;
