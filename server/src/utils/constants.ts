export const API_CONSTANTS = {
  DOJAH_NIN_ENDPOINT: "/kyc/nin",
  DOJAH_FACE_COMPARE_ENDPOINT: "/kyc/face/compare",
  
  HTTP_STATUS: {
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    BAD_REQUEST: 400
  },
  
  ERROR_MESSAGES: {
    NIN_NOT_FOUND: "NIN not found in the system. Please check the number.",
    TOO_MANY_ATTEMPTS: "Too many verification attempts. Please try again in a few minutes.",
    VERIFICATION_TIMEOUT: "Verification timeout. Please try again.",
    SERVICE_UNAVAILABLE: "NIN verification service temporarily unavailable",
    FACE_COMPARE_UNAVAILABLE: "Face comparison service temporarily unavailable",
    INVALID_IMAGES: "Invalid images provided. Please send clear, front-facing photos.",
    FACE_COMPARE_ATTEMPTS: "Too many face comparison attempts. Please try again later."
  }
};

export const TIMEOUT_CONSTANTS = {
  NIN_VERIFICATION: 30000, // 30 seconds
  MEDIA_DOWNLOAD: 45000,   // 45 
  FACE_COMPARE: 45000      
};

export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
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

export const S3_CONSTANTS = {
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