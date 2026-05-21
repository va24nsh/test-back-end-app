/**
 * User Model
 * 
 * Sequelize model for the users table based on database design.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

// Define the User attributes interface
export interface UserAttributes {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  emailPending?: string | null;
  emailVerificationTokenHash?: string | null;
  emailVerificationExpiresAt?: Date | null;
  emailVerificationSentAt?: Date | null;
  phoneNumber: string;
  profilePicture?: string;
  address?: string | null;
  city?: string | null;
  state?: string;
  country?: string;
  postalCode?: string | null;
  gender?: string;
  age?: number;
  provider: string[];
  isActive: boolean;
  isVerified: boolean;
  isProfileCompleted: boolean;
  isOnboarded: boolean;
  isAdmin: boolean;
  firebaseUserId: string;
  designation?: string;
  specialization?: string;
  department?: string;
  totalExperience?: number;
  joiningDate?: Date;
  licenseNumber?: string;
  licenseUrl?: string;
  failedLoginAttempts: number;
  emailVerificationActionCount: number;
  lockedAt?: Date;
  lastLoginAt?: Date;
  isTermsAndConditionsAccepted: boolean;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the User creation attributes
export interface UserCreationAttributes extends Optional<UserAttributes,
  'id' | 'firstName' | 'lastName' | 'email' | 'emailPending' | 'profilePicture' |
  'address' | 'city' | 'state' | 'country' | 'postalCode' | 'gender' |
  'age' | 'designation' | 'specialization' | 'department' |
  'totalExperience' | 'joiningDate' | 'licenseNumber' | 'licenseUrl' |
  'lockedAt' | 'lastLoginAt' | 'otp' | 'otpExpiresAt' |
  'emailVerificationTokenHash' | 'emailVerificationExpiresAt' | 'emailVerificationSentAt' |
  'createdAt' | 'updatedAt'> {}

// Define the User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firstName?: string | null;
  public lastName?: string | null;
  public email?: string | null;
  public emailPending?: string | null;
  public emailVerificationTokenHash?: string | null;
  public emailVerificationExpiresAt?: Date | null;
  public emailVerificationSentAt?: Date | null;
  public phoneNumber!: string;
  public profilePicture?: string;
  public address?: string | null;
  public city?: string | null;
  public state?: string;
  public country?: string;
  public postalCode?: string | null;
  public gender?: string;
  public age?: number;
  public provider!: string[];
  public isActive!: boolean;
  public isVerified!: boolean;
  public isProfileCompleted!: boolean;
  public isOnboarded!: boolean;
  public isAdmin!: boolean;
  public firebaseUserId!: string;
  public designation?: string;
  public specialization?: string;
  public department?: string;
  public totalExperience?: number;
  public joiningDate?: Date;
  public licenseNumber?: string;
  public licenseUrl?: string;
  public failedLoginAttempts!: number;
  public emailVerificationActionCount!: number;
  public lockedAt?: Date;
  public lastLoginAt?: Date;
  public isTermsAndConditionsAccepted!: boolean;
  public otp?: string | null;
  public otpExpiresAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'email',
      validate: {
        isEmail: true,
      },
    },
    emailPending: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'email_pending',
      validate: {
        isEmail: true,
      },
    },
    emailVerificationTokenHash: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'email_verification_token_hash',
    },
    emailVerificationExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_expires_at',
    },
    emailVerificationSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_sent_at',
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'phone_number',
    },
    profilePicture: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'profile_picture',
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'address',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'city',
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'postal_code',
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    provider: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: ['phone'],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified',
    },
    isOnboarded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_onboarded',
    },
    isProfileCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_profile_completed',
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_admin',
    },
    firebaseUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'firebase_user_id',
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'total_experience',
    },
    joiningDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'joining_date',
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'license_number',
    },
    licenseUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'license_url',
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'failed_login_attempts',
    },
    emailVerificationActionCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'email_verification_action_count',
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'locked_at',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
    isTermsAndConditionsAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_terms_and_conditions_accepted',
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: '6-character alphanumeric OTP for email verification',
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'otp_expires_at',
      comment: 'OTP expiration timestamp (24 hours from generation)',
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
    tableName: 'users',
    timestamps: true,
    underscored: false,
    indexes: [],
    hooks: {
      beforeValidate: (user: User) => {
        if (user.email && typeof user.email === 'string') {
          user.email = user.email.toLowerCase().trim();
        }
        if (user.emailPending && typeof user.emailPending === 'string') {
          user.emailPending = user.emailPending.toLowerCase().trim();
        }
        if (user.emailVerificationTokenHash && typeof user.emailVerificationTokenHash === 'string') {
          user.emailVerificationTokenHash = user.emailVerificationTokenHash.trim();
        }
      },
      beforeCreate: (user: User) => {
        if (user.email && typeof user.email === 'string') {
          user.email = user.email.toLowerCase().trim();
        }
        if (user.emailPending && typeof user.emailPending === 'string') {
          user.emailPending = user.emailPending.toLowerCase().trim();
        }
        if (user.emailVerificationTokenHash && typeof user.emailVerificationTokenHash === 'string') {
          user.emailVerificationTokenHash = user.emailVerificationTokenHash.trim();
        }
      },
      beforeUpdate: (user: User) => {
        if (user.email && typeof user.email === 'string') {
          user.email = user.email.toLowerCase().trim();
        }
        if (user.emailPending && typeof user.emailPending === 'string') {
          user.emailPending = user.emailPending.toLowerCase().trim();
        }
        if (user.emailVerificationTokenHash && typeof user.emailVerificationTokenHash === 'string') {
          user.emailVerificationTokenHash = user.emailVerificationTokenHash.trim();
        }
      },
    },
  }
);

export default User;
