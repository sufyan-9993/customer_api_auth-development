// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Response Messages
export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Invalid request',
  INTERNAL_ERROR: 'Internal server error',
  USER_NOT_FOUND: 'User not found',
} as const;

// Environment Types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  SIT: 'sit',
  PREPROD: 'preprod',
  PRODUCTION: 'production',
  DR: 'dr',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

// Database Types
export const DATABASE_TYPES = {
  MYSQL: 'mysql',
  COSMOS: 'cosmos',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// JWT Constants
export const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// CORS Origins (can be overridden by environment variables)
export const CORS_ORIGINS = {
  DEVELOPMENT: 'http://localhost:3000',
  PRODUCTION: '*',
} as const;

export enum LocationType {
  COUNTRY = 'country',
  STATE = 'state',
  CITY = 'city',
}

export enum status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum OtpType {
  MOBILE = 'mobile',
  EMAIL = 'email',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum PointOfInterconnectEnum {
  FLAT_BED = 'Flat_bed',
  HYPERBOLIC = 'Hyperbolic',
}

export enum UserTerminalTypeEnum {
  CAPACITY_POOL = 'Capacity_Pool',
  VOLUME_POOL = 'Volume_Pool',
}
