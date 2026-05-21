/**
 * Consent Audit Trail Model
 * 
 * Immutable request-level audit trail for compliance
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface ConsentAuditTrailAttributes {
  id: string;
  consentRequestId: string;
  actionType: string;
  actorType: string;
  actorId?: string | null;
  actionDetails?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: string | null;
  geoLocation?: string | null;
  actionTimestamp: Date;
  createdAt: Date;
}

export class ConsentAuditTrail extends Model<ConsentAuditTrailAttributes> implements ConsentAuditTrailAttributes {
  declare id: string;
  declare consentRequestId: string;
  declare actionType: string;
  declare actorType: string;
  declare actorId: string | null;
  declare actionDetails: Record<string, any> | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare deviceInfo: string | null;
  declare geoLocation: string | null;
  declare actionTimestamp: Date;
  declare createdAt: Date;
}

ConsentAuditTrail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consentRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'consent_requests', key: 'id' },
      onDelete: 'SET NULL',
    },
    actionType: {
      type: DataTypes.ENUM('CREATED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED', 'MODIFIED', 'VIEWED'),
      allowNull: false,
    },
    actorType: {
      type: DataTypes.ENUM('PATIENT', 'DOCTOR', 'SYSTEM', 'ADMIN'),
      allowNull: false,
    },
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    actionDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Details like old/new scope, reasons, metadata',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    geoLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    actionTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'consent_audit_trail',
    timestamps: false,
    indexes: [
      { fields: ['consentRequestId', 'actionTimestamp'] },
      { fields: ['actionType'] },
      { fields: ['actorType'] },
    ],
  }
);

export default ConsentAuditTrail;
