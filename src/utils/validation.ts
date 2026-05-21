// Validation utilities
// TODO: Add validation helpers using Zod or similar

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // TODO: Add password validation rules
  return password.length >= 8;
};

