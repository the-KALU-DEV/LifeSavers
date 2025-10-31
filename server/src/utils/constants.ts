//magic numbers
export const MIN_DONOR_AGE = 18;
export const MAX_DONOR_AGE = 70;
export const DONATION_COOLDOWN_DAYS = 56;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  
export const MAX_REQUESTS_PER_MINUTE = 60;
export const MAX_MESSAGES_PER_HOUR = 100;

//donor constants
export const REGISTRATION_STEPS = {
  INITIAL: 'initial',
  NAME: 'name',
  BLOOD_TYPE: 'blood_type',
  GENOTYPE: 'genotype',
  MEDICAL_SCREENING: 'medical_screening',
  LOCATION: 'location',
  BANK_DETAILS: 'bank_details',
  ID_VERIFICATION: 'id_verification',
  COMPLETE: 'complete'
} as const;

export const BLOOD_TYPE_OPTIONS = {
  'A': 'A+', 'B': 'A-', 'C': 'B+', 'D': 'B-',
  'E': 'O+', 'F': 'O-', 'G': 'AB+', 'H': 'AB-'
} as const;

export const GENOTYPE_OPTIONS = {
  'A': 'AA', 'B': 'AS', 'C': 'AC', 'D': 'SS'
} as const;

export const DONOR_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected'
} as const;

export const ELIGIBILITY_STATUS = {
  ELIGIBLE: 'eligible',
  INELIGIBLE: 'ineligible',
  TEMPORARY_INELIGIBLE: 'temporary_ineligible'
} as const;

export const MEDICAL_STATUS = {
  HIV: {
    NEGATIVE: 'negative',
    POSITIVE: 'positive',
    UNKNOWN: 'unknown'
  },
  HEPATITIS: {
    NEGATIVE: 'negative',
    POSITIVE: 'positive',
    IMMUNE: 'immune',
    UNKNOWN: 'unknown'
  }
} as const;

export const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Kano', 'Rivers', 'Delta', 'Oyo', 'Kaduna', 'Edo',
  'Ogun', 'Enugu', 'Plateau', 'Sokoto', 'Bornu', 'Bayelsa', 'Imo', 'Anambra',
  'Akwa Ibom', 'Cross River', 'Katsina', 'Kebbi', 'Kogi', 'Osun', 'Taraba',
  'Yobe', 'Zamfara', 'Bauchi', 'Benue', 'Nasarawa', 'Niger', 'Gombe', 'Jigawa',
  'Ekiti', 'Abia', 'Ebonyi', 'Bayelsa', 'Kwara', 'Ondo'
] as const;

export const MAJOR_CITIES = [
  'LAGOS', 'ABUJA', 'KANO', 'IBADAN', 'PORT HARCOURT', 'BENIN', 'ABA', 'ONITSHA',
  'ENUGU', 'CALABAR', 'UYO', 'OWERRI', 'JOS', 'KADUNA', 'MAIDUGURI', 'SOKOTO'
] as const;

//for validation
//validation patterns from chatgpt
export const VALIDATION_PATTERNS = {
  //phone numbers (E.164 format)
  PHONE_NUMBER: /^\+\d{10,15}$/,
  
  //nigerian account numbers (10 digits)
  ACCOUNT_NUMBER: /^\d{10}$/,
  
  //names (letters, spaces, hyphens, apostrophes)
  NAME: /^[a-zA-Z\s\-'.]+$/,
  
  //location (letters, spaces, commas, hyphens)
  LOCATION: /^[a-zA-Z\s,\-']+$/,
  
  //bank names (letters, numbers, spaces)
  BANK_NAME: /^[a-zA-Z0-9\s&.-]+$/,
  
  //account names (letters and spaces)
  ACCOUNT_NAME: /^[a-zA-Z\s]+$/,
  
  //government ID numbers (alphanumeric with common separators)
  GOVERNMENT_ID: /^[a-zA-Z0-9\s\-/]+$/,
  
  //URLs for document uploads
  URL: /^https?:\/\/.+\..+$/,
  
  //date formats (DD/MM/YYYY or YYYY-MM-DD)
  DATE: /^(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})$/
} as const;

//error validation messages
export const VALIDATION_MESSAGES = {
  NAME: {
    REQUIRED: 'Name is required',
    MIN_LENGTH: 'Name must be at least 2 characters',
    MAX_LENGTH: 'Name must be less than 100 characters',
    INVALID_FORMAT: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
    FULL_NAME_REQUIRED: 'Please provide both first and last name'
  },
  
  PHONE: {
    REQUIRED: 'Phone number is required',
    INVALID_FORMAT: 'Phone number must be in E.164 format (e.g., +2348012345678)'
  },
  
  BLOOD_TYPE: {
    REQUIRED: 'Blood type is required',
    INVALID: 'Please select a valid blood type option (A-H)'
  },
  
  GENOTYPE: {
    REQUIRED: 'Genotype is required',
    INVALID: 'Please select a valid genotype option (A-D)'
  },
  
  LOCATION: {
    REQUIRED: 'Location is required',
    MIN_LENGTH: 'Location must be at least 2 characters',
    MAX_LENGTH: 'Location must be less than 200 characters',
    INVALID_FORMAT: 'Location can only contain letters, spaces, commas, and hyphens',
    CITY_REQUIRED: 'Please provide at least a city name'
  },
  
  BANK: {
    BANK_NAME_REQUIRED: 'Bank name is required',
    BANK_NOT_SUPPORTED: 'Bank not supported',
    ACCOUNT_NUMBER_REQUIRED: 'Account number is required',
    ACCOUNT_NUMBER_INVALID: 'Account number must be exactly 10 digits',
    ACCOUNT_NAME_REQUIRED: 'Account name is required',
    ACCOUNT_NAME_MIN_LENGTH: 'Account name must be at least 2 characters'
  },
  
  MEDICAL: {
    INVALID_RESPONSE: 'Please reply with: YES, NO, or UNSURE',
    SCREENING_REQUIRED: 'Medical screening is required for donor safety'
  },
  
  DOCUMENT: {
    REQUIRED: 'Document is required',
    INVALID_URL: 'Invalid document URL',
    UNSUPPORTED_DOMAIN: 'Document from unsupported source'
  }
} as const;

//input length limits
export const INPUT_LIMITS = {
  NAME: { MIN: 2, MAX: 100 },
  LOCATION: { MIN: 2, MAX: 200 },
  ACCOUNT_NAME: { MIN: 2, MAX: 100 },
  BANK_NAME: { MIN: 2, MAX: 50 },
  CHRONIC_ILLNESS_DETAILS: { MAX: 500 },
  REJECTION_REASON: { MAX: 1000 }
} as const;

//for bank validation
//all supported nigerian banks
export const SUPPORTED_BANKS = [
  'ACCESS BANK',
  'GTBANK', 
  'ZENITH BANK',
  'UBA',
  'FIRST BANK',
  'FIDELITY BANK',
  'UNION BANK',
  'STANBIC IBTC',
  'ECOBANK',
  'STERLING BANK',
  'WEMA BANK',
  'POLARIS BANK',
  'FCMB',
  'HERITAGE BANK',
  'JAIZ BANK',
  'KUDA',
  'RUBIES',
  'MONIEpoint',
  'OPAY',
  'PALMPAY'
] as const;

//bank name aliases for flexible matching
export const BANK_ALIASES: Record<string, string> = {
  'GTB': 'GTBANK',
  'GT BANK': 'GTBANK',
  'GUARANTY TRUST BANK': 'GTBANK',
  'ZENITH': 'ZENITH BANK',
  'ZENITH BANK PLC': 'ZENITH BANK',
  'UBA': 'UBA',
  'UNITED BANK FOR AFRICA': 'UBA',
  'FIRST BANK': 'FIRST BANK',
  'FIRST BANK OF NIGERIA': 'FIRST BANK',
  'FBN': 'FIRST BANK',
  'ACCESS': 'ACCESS BANK',
  'ACCESS BANK PLC': 'ACCESS BANK',
  'ECOBANK': 'ECOBANK',
  'ECOBANK NIGERIA': 'ECOBANK',
  'FIDELITY': 'FIDELITY BANK',
  'FIDELITY BANK PLC': 'FIDELITY BANK',
  'UNION': 'UNION BANK',
  'UNION BANK OF NIGERIA': 'UNION BANK',
  'STANBIC': 'STANBIC IBTC',
  'STANBIC IBTC BANK': 'STANBIC IBTC',
  'STERLING': 'STERLING BANK',
  'STERLING BANK PLC': 'STERLING BANK',
  'WEMA': 'WEMA BANK',
  'WEMA BANK PLC': 'WEMA BANK',
  'POLARIS': 'POLARIS BANK',
  'POLARIS BANK LIMITED': 'POLARIS BANK',
  'FCMB': 'FCMB',
  'FIRST CITY MONUMENT BANK': 'FCMB',
  'HERITAGE': 'HERITAGE BANK',
  'HERITAGE BANKING COMPANY': 'HERITAGE BANK',
  'JAIZ': 'JAIZ BANK',
  'JAIZ BANK PLC': 'JAIZ BANK'
};

//bank codes (for potential future integration)
export const BANK_CODES: Record<string, string> = {
  'ACCESS BANK': '044',
  'GTBANK': '058',
  'ZENITH BANK': '057',
  'UBA': '033',
  'FIRST BANK': '011',
  'FIDELITY BANK': '070',
  'UNION BANK': '032',
  'STANBIC IBTC': '039',
  'ECOBANK': '050',
  'STERLING BANK': '232',
  'WEMA BANK': '035',
  'POLARIS BANK': '076',
  'FCMB': '214',
  'HERITAGE BANK': '030',
  'JAIZ BANK': '301'
};

//for messages
//welcome and general messages
export const WELCOME_MESSAGES = {
  GREETING: `🩸 Welcome to LifeSavers Blood Donation Network! 💝

Choose an option:
1. Register as a Blood Donor
2. Register as a Hospital (Coming Soon)
3. Learn How It Works

Reply 1, 2, or 3:`,

  REGISTRATION_START: `❤️ Thank you for choosing to save lives! 

Let's get you registered as a blood donor.

What's your full name?`,

  DONOR_GUIDE: `🩸 HOW IT WORKS:

• Register as a donor in 5 minutes
• Get notified when your blood type is needed  
• Help save lives in your community
• Earn incentives for donations

Ready to become a LifeSaver? Reply 1 to start!`,

  SYSTEM_GUIDE: `🏥 BLOOD DONATION SYSTEM

We connect blood donors with hospitals and patients in need.

• Donors register with their blood type and location
• Hospitals request specific blood types
• We match donors with nearby requests
• You get notified and can choose to help

Save lives in your community! 💝`
} as const;

//success messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_COMPLETE: (donorId: string, name: string) => 
`🎉 REGISTRATION COMPLETE! 🎉

✅ ${name}
✅ Donor ID: ${donorId}
✅ Registration Successful

💝 You're now a registered LifeSaver!

We'll notify you when patients need your blood type. Thank you for choosing to save lives! ❤️`,

  STEP_COMPLETED: (step: string) => `✅ ${step} saved successfully!`,

  MEDICAL_ELIGIBLE: `✅ Medical screening passed! You are eligible to donate blood.`,

  DOCUMENT_RECEIVED: `✅ Document received! Our team will verify it shortly.`
} as const;

//error messages
export const ERROR_MESSAGES = {
  //system errors
  SYSTEM_ERROR: '❌ System error. Please try again later.',
  DATABASE_ERROR: '❌ Database error. Please try again.',
  NETWORK_ERROR: '❌ Network error. Please check your connection.',
  
  //validation errors
  INVALID_NAME: '❌ Please provide a valid full name (minimum 2 characters).',
  INVALID_BLOOD_TYPE: '❌ Please select a valid blood type from options A-H.',
  INVALID_GENOTYPE: '❌ Please select a valid genotype from options A-D.',
  INVALID_MEDICAL_RESPONSE: '❌ Please provide all required medical information.',
  INVALID_LOCATION: '❌ Please provide a valid location (city and state).',
  INVALID_BANK_DETAILS: '❌ Please provide valid bank details in the correct format.',
  INVALID_DOCUMENT: '❌ Please send a clear photo of your government ID.',
  
  //business logic errors
  DUPLICATE_DONOR: '❌ You are already registered as a donor.',
  UNDER_AGE: `❌ You must be at least 18 years old to donate blood.`,
  OVER_AGE: `❌ Maximum donor age is 65 years.`,
  MEDICALLY_INELIGIBLE: '❌ Based on medical guidelines, we cannot accept donations at this time.',
  COOLDOWN_PERIOD: '❌ You recently donated blood. Please wait 56 days between donations.',
  
  //session errors
  SESSION_EXPIRED: '❌ Your session expired. Please start registration again.',
  INVALID_STEP: '❌ Invalid step. Please start registration again.',
  
  //permission prrors
  UNAUTHORIZED: '❌ Unauthorized access.',
  FORBIDDEN: '❌ Access forbidden.'
} as const;

//medical screening messages
export const MEDICAL_MESSAGES = {
  SCREENING_PROMPT: `🏥 Medical Screening

For the safety of blood recipients, we need to know your status for:

• HIV
• Hepatitis B  
• Hepatitis C

Your response is confidential.

Do you have any of these conditions?

Reply:
YES - if you have any
NO - if you don't have any
UNSURE - if you don't know your status`,

  DETAILED_SCREENING: `🩺 Please specify which condition:

1) HIV Positive
2) Hepatitis B  
3) Hepatitis C
4) Multiple conditions

Reply with the number(s), or type "all clear" if none.`,

  MEDICALLY_INELIGIBLE: (reasons: string[]) =>
`❌ MEDICALLY INELIGIBLE

Unfortunately, you cannot donate blood due to:
${reasons.map(r => `• ${r}`).join('\n')}

This is for recipient safety. Please consult a doctor.`,

  NEEDS_MEDICAL_CLEARANCE: `⚠️ You need medical clearance before donating. Please consult a healthcare provider and provide your test results.`
} as const;

//bank detail messages
export const BANK_MESSAGES = {
  PROMPT: (name: string) => 
`🏦 Bank Details (Required)

For donation incentives, please provide:

Format:
Bank Name: [Your Bank]
Account No: [10 digits]  
Account Name: [Your Name]

Example:
Bank Name: GTBank
Account No: 0123456789
Account Name: ${name}`,

  VALIDATION_ERROR: (errors: string[]) =>
`❌ Invalid bank details:
${errors.map(e => `• ${e}`).join('\n')}

Please check and resend in the correct format.`,

  SUCCESS: (bankName: string, accountNumber: string) =>
`✅ Bank Details Saved!
🏦 ${bankName}
🔢 ******${accountNumber.slice(-4)}`
} as const;

//id verification messages
export const ID_MESSAGES = {
  PROMPT: `📸 ID Verification Required

Please send a CLEAR photo of your:
• National ID
• Driver's License  
• Voter's Card
• International Passport

We keep this secure and confidential.`,

  SUCCESS: `✅ ID document received! Our team will verify it within 24 hours.`,

  RETRY: `❌ Photo not clear. Please send a CLEAR, well-lit photo of your government ID.`
} as const;