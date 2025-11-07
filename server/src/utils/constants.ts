export const API_CONSTANTS = {
  DOJAH_NIN_ENDPOINT: "/kyc/nin",
  DOJAH_FACE_COMPARE_ENDPOINT: "/kyc/face/compare",
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    ECONNABORTED: 'ECONNABORTED'
  },
  
  ERROR_MESSAGES: {
    NIN_NOT_FOUND: "NIN not found in the system. Please check the number.",
    TOO_MANY_ATTEMPTS: "Too many verification attempts. Please try again in a few minutes.",
    VERIFICATION_TIMEOUT: "Verification timeout. Please try again.",
    SERVICE_UNAVAILABLE: "NIN verification service temporarily unavailable",
    FACE_COMPARE_UNAVAILABLE: "Face comparison service temporarily unavailable",
    INVALID_IMAGES: "Invalid images provided. Please send clear, front-facing photos.",
    FACE_COMPARE_ATTEMPTS: "Too many face comparison attempts. Please try again later.",
    GCP_AUTH_FAILED: "Failed to authenticate with Google Cloud Storage.",
    GCP_FORBIDDEN: "Access to Google Cloud Storage forbidden. Check your permissions.",
    GCP_NOT_FOUND: "Google Cloud Storage bucket or object not found.",
    INVALID_API_CREDENTIALS: "Invalid API credentials provided.",
    CAC_VERIFICATION_UNAVAILABLE: "CAC verification service temporarily unavailable"
  }
};

export const TIMEOUT_CONSTANTS = {
  NIN_VERIFICATION: 30000, // 30 secs
  MEDIA_DOWNLOAD: 45000,   // 45 
  FACE_COMPARE: 45000      
};

export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CONTENT_LENGTH: 10 * 1024 * 1024, // 10MB for axios
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png']
};

export const NIN_CONSTANTS = {
  REQUIRED_LENGTH: 11,
  VALIDATION_REGEX: /^\d{11}$/,
  ERROR_MESSAGES: {
    INVALID_FORMAT: "Invalid NIN format. Must be exactly 11 digits.",
    NOT_FOUND: "No NIN record found. Please check and try again.",
    INVALID_ACTIVE: "NIN is not valid or active"
  }
};

export const FACE_COMPARE_CONSTANTS = {
  MIN_CONFIDENCE: 98,
  SUCCESS_MESSAGE: "NIN verification successful"
};

export const MAX_ATTEMPTS = 3;

export const STORAGE_CONSTANTS = {
  UPLOAD_PREFIX: "verifications",
  FILE_EXTENSIONS: {
    DEFAULT: 'jpg',
    JPEG: 'jpg',
    PNG: 'png'
  }
};

export const MEDIA_TYPES = {
  SELFIE: 'selfie' as const,
  ID: 'id' as const
} as const;