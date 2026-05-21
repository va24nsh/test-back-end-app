import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface NotificationPreferenceAttributes {
  id: string;
  userId: string;
  notificationEventId: string;
  viaEmail: boolean;
  viaSms: boolean;
  viaInApp: boolean;
  isEnabled: boolean;
  isEditable: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationPreferenceCreationAttributes = Optional<
  NotificationPreferenceAttributes,
  | 'id'
  | 'viaEmail'
  | 'viaSms'
  | 'viaInApp'
  | 'isEnabled'
  | 'isEditable'
  | 'isPublic'
  | 'createdAt'
  | 'updatedAt'
>;

export class NotificationPreference
  extends Model<NotificationPreferenceAttributes, NotificationPreferenceCreationAttributes>
  implements NotificationPreferenceAttributes
{
  public id!: string;
  public userId!: string;
  public notificationEventId!: string;
  public viaEmail!: boolean;
  public viaSms!: boolean;
  public viaInApp!: boolean;
  public isEnabled!: boolean;
  public isEditable!: boolean;
  public isPublic!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificationPreference.init(
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
    viaEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'via_email',
    },
    viaSms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'via_sms',
    },
    viaInApp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'via_in_app',
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_enabled',
    },
    isEditable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_editable',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_public',
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
    tableName: 'notification_preferences',
    timestamps: true,
    underscored: false,
  }
);
