import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NotificationChannelType = 'email' | 'in_app' | 'mobile' | 'sms';

export interface NotificationAttributes {
  id: string;
  userId: string;
  notificationEventId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: Record<string, unknown> | null;
  channelType: NotificationChannelType;
  sentAt?: Date | null;
  createdAt: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  | 'id'
  | 'priority'
  | 'isRead'
  | 'readAt'
  | 'actionUrl'
  | 'actionLabel'
  | 'metadata'
  | 'sentAt'
  | 'createdAt'
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public userId!: string;
  public notificationEventId!: string;
  public title!: string;
  public body!: string;
  public type!: NotificationType;
  public priority!: NotificationPriority;
  public isRead!: boolean;
  public readAt?: Date | null;
  public actionUrl?: string | null;
  public actionLabel?: string | null;
  public metadata?: Record<string, unknown> | null;
  public channelType!: NotificationChannelType;
  public sentAt?: Date | null;
  public readonly createdAt!: Date;
}

Notification.init(
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
    notificationEventId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'notification_event_id',
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'NORMAL',
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
    actionUrl: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'action_url',
    },
    actionLabel: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'action_label',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    channelType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'channel_type',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at',
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
    tableName: 'notifications',
    timestamps: false,
    underscored: false,
  }
);
