// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  CLUB_MEMBER: 'club_member',
  ADMIN: 'admin',
};

// Notice Types
export const NOTICE_TYPES = {
  ACADEMIC: 'academic',
  CLUB: 'club',
};

// Notice Formats
export const NOTICE_FORMATS = {
  TEXT: 'text',
  PDF: 'pdf',
};

// Club Categories
export const CLUB_CATEGORIES = {
  TECHNICAL: 'technical',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  SOCIAL: 'social',
  OTHER: 'other',
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};
