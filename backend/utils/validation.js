/**
 * Input Validation Utility
 * Provides functions to validate user inputs across the application
 */

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number validation regex (supports various formats)
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// Password validation: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Date validation (YYYY-MM-DD format)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'
    };
  }
  return { valid: true };
};

/**
 * Validate phone number
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  if (phone.length > 20) {
    return { valid: false, error: 'Phone number is too long' };
  }
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  return { valid: true };
};

/**
 * Validate name (first name, last name, etc)
 */
const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (name.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  if (name.length > 50) {
    return { valid: false, error: `${fieldName} is too long (max 50 characters)` };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  return { valid: true };
};

/**
 * Validate date of birth
 */
const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return { valid: false, error: 'Date of birth is required' };
  }
  const date = new Date(dateOfBirth);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  const age = new Date().getFullYear() - date.getFullYear();
  if (age < 13) {
    return { valid: false, error: 'User must be at least 13 years old' };
  }
  if (age > 150) {
    return { valid: false, error: 'Invalid date of birth' };
  }
  return { valid: true };
};

/**
 * Validate appointment date/time
 */
const validateAppointmentDateTime = (appointmentDate, startTime, endTime) => {
  const errors = [];

  if (!appointmentDate) {
    errors.push('Appointment date is required');
  } else {
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid appointment date');
    } else {
      date.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        errors.push('Appointment date cannot be in the past');
      }
      if (date > new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)) {
        errors.push('Appointment date cannot be more than 1 year in the future');
      }
    }
  }

  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    errors.push('Invalid start time format (use HH:MM)');
  }

  if (!endTime || !/^\d{2}:\d{2}$/.test(endTime)) {
    errors.push('Invalid end time format (use HH:MM)');
  }

  if (startTime && endTime && startTime >= endTime) {
    errors.push('End time must be after start time');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validate medical record data
 */
const validateMedicalRecord = (data) => {
  const errors = [];

  if (!data.diagnosis || typeof data.diagnosis !== 'string' || data.diagnosis.trim().length === 0) {
    errors.push('Diagnosis is required');
  }
  if (data.diagnosis && data.diagnosis.length > 1000) {
    errors.push('Diagnosis is too long (max 1000 characters)');
  }

  if (data.prescription && data.prescription.length > 2000) {
    errors.push('Prescription is too long (max 2000 characters)');
  }

  if (data.notes && data.notes.length > 3000) {
    errors.push('Notes is too long (max 3000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validate user registration data
 */
const validateRegistration = (data) => {
  const errors = [];

  // Validate first name
  const firstNameValidation = validateName(data.firstName, 'First name');
  if (!firstNameValidation.valid) {
    errors.push(firstNameValidation.error);
  }

  // Validate last name
  const lastNameValidation = validateName(data.lastName, 'Last name');
  if (!lastNameValidation.valid) {
    errors.push(lastNameValidation.error);
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.error);
  }

  // Validate phone
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error);
    }
  }

  // Validate gender
  if (data.gender && !['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
    errors.push('Invalid gender value');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Validate user profile update
 */
const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.firstName) {
    const nameValidation = validateName(data.firstName, 'First name');
    if (!nameValidation.valid) {
      errors.push(nameValidation.error);
    }
  }

  if (data.lastName) {
    const nameValidation = validateName(data.lastName, 'Last name');
    if (!nameValidation.valid) {
      errors.push(nameValidation.error);
    }
  }

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error);
    }
  }

  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error);
    }
  }

  if (data.dateOfBirth) {
    const dateValidation = validateDateOfBirth(data.dateOfBirth);
    if (!dateValidation.valid) {
      errors.push(dateValidation.error);
    }
  }

  if (data.gender && !['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
    errors.push('Invalid gender value');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * Middleware for validation error handling
 */
const validationErrorHandler = (validationResult) => {
  if (!validationResult.valid) {
    const errorMessage = Array.isArray(validationResult.errors)
      ? validationResult.errors.join('; ')
      : validationResult.errors || 'Validation failed';
    const error = new Error(errorMessage);
    error.status = 400;
    error.validationErrors = validationResult.errors;
    throw error;
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateDateOfBirth,
  validateAppointmentDateTime,
  validateMedicalRecord,
  validateRegistration,
  validateProfileUpdate,
  validationErrorHandler,
  // Export regex patterns for frontend use
  emailRegex,
  phoneRegex,
  passwordRegex,
  dateRegex
};
