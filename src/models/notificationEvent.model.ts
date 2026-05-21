import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface NotificationEventAttributes {
  id: string;
  eventName: string;
  eventCode: string;
  category: string;
  version: string;
  description?: string | null;
  configurations: Record<string, unknown>;
  defaultTitleTemplate?: string | null;
  defaultBodyTemplate?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export type NotificationEventCreationAttributes = Optional<
  NotificationEventAttributes,
  'id' | 'description' | 'defaultTitleTemplate' | 'defaultBodyTemplate' | 'isActive' | 'createdAt'
>;

export class NotificationEvent
  extends Model<NotificationEventAttributes, NotificationEventCreationAttributes>
  implements NotificationEventAttributes
{
  public id!: string;
  public eventName!: string;
  public eventCode!: string;
  public category!: string;
  public version!: string;
  public description?: string | null;
  public configurations!: Record<string, unknown>;
  public defaultTitleTemplate?: string | null;
  public defaultBodyTemplate?: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
}

NotificationEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    eventName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'event_name',
    },
    eventCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'event_code',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    configurations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    defaultTitleTemplate: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'default_title_template',
    },
    defaultBodyTemplate: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'default_body_template',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'notification_events',
    timestamps: false,
    underscored: false,
  }
);
