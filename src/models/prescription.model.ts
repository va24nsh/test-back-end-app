import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface PrescriptionAttributes {
  id: string;
  visitId: string | null;
  patientId: string;
  doctorName: string;
  doctorSpeciality: string | null;
  clinic: string | null;
  diagnosis: string[];
  complaints: string[] | null;
  tests: string[] | null;
  advice: string | null;
  medicines: Medicine[];
  notes: string;
  followUpNotes: string;
  followUpDate: string | null;
  prescriptionDate: string;
  status: PrescriptionStatus;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PrescriptionCreationAttributes = Optional<
  PrescriptionAttributes,
  'id' | 'visitId' | 'doctorSpeciality' | 'clinic' | 'complaints' | 'tests' | 'advice' | 'followUpNotes' | 'followUpDate' | 'isDeleted' | 'deletedAt' | 'deletedBy' | 'createdAt' | 'updatedAt'
>;

export class Prescription extends Model<PrescriptionAttributes, PrescriptionCreationAttributes> implements PrescriptionAttributes {
  public id!: string;
  public visitId!: string | null;
  public patientId!: string;
  public doctorName!: string;
  public doctorSpeciality!: string | null;
  public clinic!: string | null;
  public diagnosis!: string[];
  public complaints!: string[] | null;
  public tests!: string[] | null;
  public advice!: string | null;
  public medicines!: Medicine[];
  public notes!: string;
  public followUpNotes!: string;
  public followUpDate!: string | null;
  public prescriptionDate!: string;
  public status!: PrescriptionStatus;
  public createdBy!: string;
  public updatedBy!: string;
  public isDeleted!: boolean;
  public deletedAt!: Date | null;
  public deletedBy!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prescription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    visitId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'visit_id',
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'patient_id',
    },
    doctorName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'doctor_name',
    },
    doctorSpeciality: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'doctor_speciality',
    },
    clinic: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    diagnosis: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
    },
    complaints: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    tests: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    advice: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicines: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    followUpNotes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'follow_up_notes',
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'follow_up_date',
    },
    prescriptionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'prescription_date',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'updated_by',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_deleted',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'deleted_by',
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
    tableName: 'prescriptions',
    timestamps: true,
    underscored: false,
  }
);
