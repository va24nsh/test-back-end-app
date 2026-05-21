import * as admin from 'firebase-admin';
import adminApp from '@firebase/firebaseAdmin';
import { config } from '@config/environment';
import { UnauthorizedError } from '@errors';
import { LoggerFactory } from '@adapters';

// Create logger instance
const loggerFactory = new LoggerFactory();
const logger = loggerFactory.createLogger('FirebaseAuth');

export interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

/**
 * Verify Firebase ID token and return user information
 */
export const verifyFirebaseToken = async (idToken: string): Promise<FirebaseUser> => {
  try {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      throw new UnauthorizedError('Firebase not initialized');
    }

    const decodedToken = await adminApp.auth().verifyIdToken(idToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      displayName: decodedToken.name || undefined,
      photoURL: decodedToken.picture || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // "no kid claim" means the token is not a Firebase ID token (e.g. a backend JWT).
    // Log at debug level so it doesn't pollute error logs when used in a fallthrough middleware.
    const isNonFirebaseToken = message.includes('no "kid" claim') || message.includes("no 'kid' claim");
    if (isNonFirebaseToken) {
      logger.debug('Firebase token verification skipped (not a Firebase ID token):', { errorMessage: message });
    } else {
      logger.error('Firebase token verification failed:', {
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: message,
      });
    }
    throw new UnauthorizedError('Invalid Firebase token');
  }
};

/**
 * Encrypt email using CryptoJS AES (same as frontend)
 * TODO: Implement encryption utility
 */
export const encryptEmail = (email: string): string => {
  try {
    // TODO: Implement encryption
    // const { encrypt } = require('../utils/encryption');
    // return encrypt(email, config.ENCRYPTION_KEY);
    return email; // Placeholder
  } catch (error) {
    logger.error('Email encryption failed:', { 
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to encrypt email');
  }
};

/**
 * Decrypt email using CryptoJS AES (same as frontend)
 * TODO: Implement encryption utility
 */
export const decryptEmail = (encryptedEmail: string): string => {
  try {
    // TODO: Implement decryption
    // const { decrypt } = require('../utils/encryption');
    // return decrypt(encryptedEmail, config.ENCRYPTION_KEY);
    return encryptedEmail; // Placeholder
  } catch (error) {
    logger.error('Email decryption failed:', { 
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to decrypt email');
  }
};

/**
 * Validate X-CryptID header against user email
 */
export const validateCryptId = (cryptId: string, userEmail: string): boolean => {
  try {
    const decryptedEmail = decryptEmail(cryptId);
    return decryptedEmail.toLowerCase() === userEmail.toLowerCase();
  } catch (error) {
    logger.error('X-CryptID validation failed:', { 
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
};

export default adminApp;

