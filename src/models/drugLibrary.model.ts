/**
 * Drug Library Model
 * 
 * Master table for drug/medication information
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '@config/database';

export interface DrugLibraryAttributes {
  id: string;
  drugName: string;
  genericName?: string | null;
  drugType?: string | null;
  description?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  brandNames?: string[] | null;
  brandMetadata?: Record<string, any>[] | null;
  extraInfo?: Record<string, any> | null;
  isPrescriptionRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DrugLibrary extends Model<DrugLibraryAttributes> implements DrugLibraryAttributes {
  declare id: string;
  declare drugName: string;
  declare genericName: string | null;
  declare drugType: string | null;
  declare description: string | null;
  declare dosageForm: string | null;
  declare strength: string | null;
  declare brandNames: string[] | null;
  declare brandMetadata: Record<string, any>[] | null;
  declare extraInfo: Record<string, any> | null;
  declare isPrescriptionRequired: boolean;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

DrugLibrary.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    drugName: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    genericName: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    drugType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dosageForm: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    strength: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    brandNames: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of brand/trade names',
    },
    brandMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Brand name metadata with manufacturer, country, strength',
    },
    extraInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Clinical and safety information: contraindications, side_effects, interactions',
    },
    isPrescriptionRequired: {
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
    tableName: 'drug_library',
    timestamps: true,
    indexes: [
      { fields: ['drugName'] },
      { fields: ['genericName'] },
      { fields: ['isActive'] },
      { fields: ['brandNames'], using: 'gin' },
    ],
  }
);

export default DrugLibrary;
