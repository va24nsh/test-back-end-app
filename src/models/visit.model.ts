/**
 * Visit Model
 * 
 * Stores patient visit/log entries
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface VisitAttributes {
  id: string;
  userId: string;
  visitType: string;
  visitDate: Date;
  visitTime?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  referredByDoctorName?: string | null;
  clinicName?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  medicines?: Record<string, any> | null;
  prescriptionSummary?: string | null;
  notes?: string | null;
  vitalSigns?: Record<string, any> | null;
  consultancyDuration?: string | null;
  isFollowupRequired: boolean;
  followUpDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Visit extends Model<VisitAttributes> implements VisitAttributes {
  declare id: string;
  declare userId: string;
  declare visitType: string;
  declare visitDate: Date;
  declare visitTime: string | null;
  declare doctorId: string | null;
  declare doctorName: string | null;
  declare referredByDoctorName: string | null;
  declare clinicName: string | null;
  declare chiefComplaint: string | null;
  declare diagnosis: string | null;
  declare medicines: Record<string, any> | null;
  declare prescriptionSummary: string | null;
  declare notes: string | null;
  declare vitalSigns: Record<string, any> | null;
  declare consultancyDuration: string | null;
  declare isFollowupRequired: boolean;
  declare followUpDate: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Visit.init(
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
    visitType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    visitDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    visitTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'doctors', key: 'id' },
      onDelete: 'SET NULL',
    },
    doctorName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    referredByDoctorName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    clinicName: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicines: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    prescriptionSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vitalSigns: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    consultancyDuration: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isFollowupRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    followUpDate: {
      type: DataTypes.DATE,
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
    tableName: 'visits',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['visitDate'] },
      { fields: ['userId', 'visitDate'] },
      { fields: ['doctorId'] },
    ],
  }
);

export default Visit;
