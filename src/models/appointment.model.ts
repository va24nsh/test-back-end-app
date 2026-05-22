import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type AppointmentStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface AppointmentAttributes {
  id: string;
  userId: string;
  doctorId: string | null;
  doctorName: string;
  doctorSpecialization: string;
  doctorHospital: string;
  doctorFees: number | null;
  patientName: string;
  patientPhone: string;
  patientGender: string;
  patientAge: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentCreationAttributes = Optional<
  AppointmentAttributes,
  'id' | 'doctorId' | 'doctorFees' | 'status' | 'cancelledAt' | 'createdAt' | 'updatedAt'
>;

export class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: string;
  public userId!: string;
  public doctorId!: string | null;
  public doctorName!: string;
  public doctorSpecialization!: string;
  public doctorHospital!: string;
  public doctorFees!: number | null;
  public patientName!: string;
  public patientPhone!: string;
  public patientGender!: string;
  public patientAge!: string;
  public date!: string;
  public timeSlot!: string;
  public status!: AppointmentStatus;
  public cancelledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
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
    doctorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'doctor_id',
    },
    doctorName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'doctor_name',
    },
    doctorSpecialization: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'doctor_specialization',
    },
    doctorHospital: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'doctor_hospital',
    },
    doctorFees: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'doctor_fees',
    },
    patientName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'patient_name',
    },
    patientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'patient_phone',
    },
    patientGender: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'patient_gender',
    },
    patientAge: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: 'patient_age',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    timeSlot: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: 'time_slot',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'UPCOMING',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at',
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
    tableName: 'appointments',
    timestamps: true,
    underscored: false,
  }
);
