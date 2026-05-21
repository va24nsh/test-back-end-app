import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface ConsentTextVersionAttributes {
  id: string;
  version: string;
  consentTextCare: string;
  consentTextTraining?: string | null;
  isActive: boolean;
  effectiveFrom?: Date | null;
  effectiveUntil?: Date | null;
  createdBy?: string | null;
  changeReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsentTextVersionCreationAttributes = Optional<ConsentTextVersionAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;

export class ConsentTextVersion
  extends Model<ConsentTextVersionAttributes, ConsentTextVersionCreationAttributes>
  implements ConsentTextVersionAttributes
{
  public id!: string;
  public version!: string;
  public consentTextCare!: string;
  public consentTextTraining?: string | null;
  public isActive!: boolean;
  public effectiveFrom?: Date | null;
  public effectiveUntil?: Date | null;
  public createdBy?: string | null;
  public changeReason?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsentTextVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    consentTextCare: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'consent_text_care',
    },
    consentTextTraining: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consent_text_training',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'effective_from',
    },
    effectiveUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'effective_until',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by',
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    changeReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'change_reason',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'consent_text_versions',
    timestamps: true,
    underscored: false,
  }
);
