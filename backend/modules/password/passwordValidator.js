// Day 1: Password Validation Utility
/**
 * Validates password strength for Service 2 (Password Management)
 * Ensures passwords have minimum length, uppercase, lowercase, and numbers.
 */
const isValidPassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (password.length < minLength) return { valid: false, message: 'Password must be at least 8 characters long.' };
  if (!hasUppercase) return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  if (!hasLowercase) return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  if (!hasNumbers) return { valid: false, message: 'Password must contain at least one number.' };
  
  return { valid: true };
};

module.exports = { isValidPassword };
