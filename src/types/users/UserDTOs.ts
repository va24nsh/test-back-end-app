/**
 * User DTOs
 * 
 * This module contains DTO (Data Transfer Object) definitions for user-related operations.
 */

export interface UserDTO {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string;
  profilePicture?: string;
  state?: string;
  country?: string;
  gender?: string;
  age?: number;
  provider: 'GOOGLE' | 'NATIVE';
  isActive: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
  isAdmin: boolean;
  firebaseUserId?: string;
  designation?: string;
  specialization?: string;
  department?: string;
  totalExperience?: number;
  joiningDate?: Date;
  licenseNumber?: string;
  licenseUrl?: string;
  lastLoginAt?: Date;
  isTermsAndConditionsAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileDTO {
  id: string;
  userId: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  provider: 'GOOGLE' | 'NATIVE';
  firebaseUserId: string;
  isTermsAndConditionsAccepted: boolean;
  preferences?: Record<string, unknown>;
  inviteId?: string;
}

export interface UserVerifyDTO {
  otp: string;
}

export interface UserOnboardingUpdateDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
}

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  gender?: string;
  age?: number;
  isActive?: boolean;
  preferences?: Record<string, unknown>;
}

export interface UserQueryDTO {
  search?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isOnboarded?: boolean;
  limit?: number;
  offset?: number;
}

export type UserDTOs = {
  UserDTO: UserDTO;
  UserProfileDTO: UserProfileDTO;
  UserCreateDTO: UserCreateDTO;
  UserVerifyDTO: UserVerifyDTO;
  UserOnboardingUpdateDTO: UserOnboardingUpdateDTO;
  UserUpdateDTO: UserUpdateDTO;
  UserQueryDTO: UserQueryDTO;
};

