import admin from 'firebase-admin';
import { config } from '@config/environment';

if (!admin.apps.length) {
  try {
    // Only initialize if we have the required Firebase credentials
    if (config.FIREBASE_PROJECT_ID && config.FIREBASE_PRIVATE_KEY && config.FIREBASE_CLIENT_EMAIL) {
      // Process the private key properly
      let processedPrivateKey = config.FIREBASE_PRIVATE_KEY;
      if (processedPrivateKey) {
        // Remove any extra quotes that might be added by environment variables
        processedPrivateKey = processedPrivateKey.replace(/^["']|["']$/g, '');
        // Replace literal \n with actual newlines
        processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');
        // Ensure the key starts with -----BEGIN PRIVATE KEY-----
        if (!processedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          console.error('Firebase private key does not have the correct PEM format');
          throw new Error('Invalid Firebase private key format');
        }
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.FIREBASE_PROJECT_ID,
          privateKey: processedPrivateKey,
          clientEmail: config.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.warn('Firebase credentials not provided, skipping Firebase initialization');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    // Don't throw error in development, just log it
    if (config.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export default admin;

