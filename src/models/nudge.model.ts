import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type NudgeType = 'REMINDER' | 'INFO' | 'PROMOTION';

export interface NudgeAttributes {
  id: string;
  userId: string;
  title: string;
  body?: string | null;
  type: NudgeType;
  nudgedByDoctorId?: string | null;
  uniqueComponentName?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NudgeCreationAttributes = Optional<
  NudgeAttributes,
  'id' | 'body' | 'nudgedByDoctorId' | 'uniqueComponentName' | 'actionUrl' | 'isRead' | 'readAt' | 'createdAt' | 'updatedAt'
>;

export class Nudge extends Model<NudgeAttributes, NudgeCreationAttributes> implements NudgeAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public body?: string | null;
  public type!: NudgeType;
  public nudgedByDoctorId?: string | null;
  public uniqueComponentName?: string | null;
  public actionUrl?: string | null;
  public isRead!: boolean;
  public readAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Nudge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    body: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'REMINDER',
    },
    nudgedByDoctorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'nudged_by_doctor_id',
      references: {
        model: 'doctors',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    uniqueComponentName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'unique_component_name',
    },
    actionUrl: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'action_url',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
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
    tableName: 'nudges',
    timestamps: true,
    underscored: false,
  }
);

export default Nudge;
