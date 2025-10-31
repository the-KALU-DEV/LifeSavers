import { z } from 'zod';
import { AppError, ValidationError } from '../../utils/error';
import { logger } from '../../utils/logger';
import { 
  BloodType, 
  BloodGenotype, 
  HIVStatus, 
  HepatitisStatus 
} from '../../types/donor.types';

export class ValidationService {
  /**
   * Name Validation - Production grade with comprehensive checks
   */
  public validateName(input: string): { 
    isValid: boolean; 
    error?: string; 
    normalizedValue?: string;
  } {
    try {
      // Zod schema for name validation
      const nameSchema = z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
        .transform(val => val.trim().replace(/\s+/g, ' ')) // Normalize whitespace
        .refine(val => val.split(' ').length >= 2, 'Please provide both first and last name');

      const result = nameSchema.safeParse(input);
      
      if (!result.success) {
        const errorMessage = result.error.errors[0]?.message || 'Invalid name format';
        return {
          isValid: false,
          error: errorMessage
        };
      }

      return {
        isValid: true,
        normalizedValue: result.data
      };

    } catch (error) {
      logger.error('Name validation error', {
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Name validation failed'
      };
    }
  }

  /**
   * Blood Type Validation with predefined options
   */
  public validateBloodType(input: string): {
    isValid: boolean;
    error?: string;
    normalizedValue?: BloodType;
  } {
    try {
      const bloodTypeSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const);
      
      const result = bloodTypeSchema.safeParse(input.toUpperCase());
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Please select a valid blood type option (A-H)'
        };
      }

      // Map to actual blood types
      const bloodTypeMap: Record<string, BloodType> = {
        'A': 'A+', 'B': 'A-', 'C': 'B+', 'D': 'B-',
        'E': 'O+', 'F': 'O-', 'G': 'AB+', 'H': 'AB-'
      };

      return {
        isValid: true,
        normalizedValue: bloodTypeMap[result.data]
      };

    } catch (error) {
      logger.error('Blood type validation error', {
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Blood type validation failed'
      };
    }
  }

  /**
   * Genotype Validation
   */
  public validateGenotype(input: string): {
    isValid: boolean;
    error?: string;
    normalizedValue?: BloodGenotype;
  } {
    try {
      const genotypeSchema = z.enum(['A', 'B', 'C', 'D'] as const);
      
      const result = genotypeSchema.safeParse(input.toUpperCase());
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Please select a valid genotype option (A-D)'
        };
      }

      // Map to actual genotypes
      const genotypeMap: Record<string, BloodGenotype> = {
        'A': 'AA', 'B': 'AS', 'C': 'AC', 'D': 'SS'
      };

      return {
        isValid: true,
        normalizedValue: genotypeMap[result.data]
      };

    } catch (error) {
      logger.error('Genotype validation error', {
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Genotype validation failed'
      };
    }
  }

  /**
   * Medical Response Validation - Comprehensive medical screening
   */
  public validateMedicalResponse(input: string): {
    isValid: boolean;
    error?: string;
    normalizedData?: {
      hivStatus: HIVStatus;
      hepatitisBStatus: HepatitisStatus;
      hepatitisCStatus: HepatitisStatus;
    };
  } {
    try {
      const normalizedInput = input.toLowerCase().trim();
      
      // Define valid responses
      const validResponses = ['yes', 'no', 'y', 'n', 'unsure', 'unknown'];
      
      if (!validResponses.includes(normalizedInput)) {
        return {
          isValid: false,
          error: 'Please reply with: YES, NO, or UNSURE'
        };
      }

      // Map responses to statuses
      let hivStatus: HIVStatus = 'unknown';
      let hepatitisBStatus: HepatitisStatus = 'unknown';
      let hepatitisCStatus: HepatitisStatus = 'unknown';

      if (normalizedInput === 'no' || normalizedInput === 'n') {
        hivStatus = 'negative';
        hepatitisBStatus = 'negative';
        hepatitisCStatus = 'negative';
      } else if (normalizedInput === 'yes' || normalizedInput === 'y') {
        // If they have conditions, we need more details (handled in step handler)
        return {
          isValid: true,
          normalizedData: {
            hivStatus: 'positive', // Default to positive if they say yes
            hepatitisBStatus: 'positive',
            hepatitisCStatus: 'positive'
          }
        };
      }

      return {
        isValid: true,
        normalizedData: {
          hivStatus,
          hepatitisBStatus,
          hepatitisCStatus
        }
      };

    } catch (error) {
      logger.error('Medical response validation error', {
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Medical screening validation failed'
      };
    }
  }

  /**
   * Detailed Medical Conditions Validation
   */
  public validateDetailedMedicalConditions(input: string): {
    isValid: boolean;
    error?: string;
    normalizedData?: {
      hivStatus: HIVStatus;
      hepatitisBStatus: HepatitisStatus;
      hepatitisCStatus: HepatitisStatus;
    };
  } {
    try {
      const normalizedInput = input.toLowerCase().trim();
      
      let hivStatus: HIVStatus = 'negative';
      let hepatitisBStatus: HepatitisStatus = 'negative';
      let hepatitisCStatus: HepatitisStatus = 'negative';

      // Parse conditions from input
      if (normalizedInput.includes('1') || normalizedInput.includes('hiv')) {
        hivStatus = 'positive';
      }
      if (normalizedInput.includes('2') || normalizedInput.includes('hepatitis b')) {
        hepatitisBStatus = 'positive';
      }
      if (normalizedInput.includes('3') || normalizedInput.includes('hepatitis c')) {
        hepatitisCStatus = 'positive';
      }
      if (normalizedInput.includes('all clear') || normalizedInput.includes('none')) {
        // Keep as negative (default)
      }

      return {
        isValid: true,
        normalizedData: {
          hivStatus,
          hepatitisBStatus,
          hepatitisCStatus
        }
      };

    } catch (error) {
      logger.error('Detailed medical conditions validation error', {
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Medical conditions validation failed'
      };
    }
  }

  /**
   * Location Validation
   */
  public validateLocation(input: string): {
    isValid: boolean;
    error?: string;
    normalizedData?: {
      city: string;
      state: string;
      country: string;
    };
  } {
    try {
      const locationSchema = z.string()
        .min(2, 'Location must be at least 2 characters')
        .max(200, 'Location must be less than 200 characters')
        .regex(/^[a-zA-Z\s,\-']+$/, 'Location can only contain letters, spaces, commas, and hyphens');

      const result = locationSchema.safeParse(input);
      
      if (!result.success) {
        const errorMessage = result.error.errors[0]?.message || 'Invalid location format';
        return {
          isValid: false,
          error: errorMessage
        };
      }

      // Parse city and state from input (e.g., "Lagos, Nigeria")
      const [city, ...stateParts] = result.data.split(',').map(part => part.trim());
      const state = stateParts.join(', ') || 'Unknown';

      if (!city || city.length < 2) {
        return {
          isValid: false,
          error: 'Please provide at least a city name'
        };
      }

      return {
        isValid: true,
        normalizedData: {
          city,
          state,
          country: 'Nigeria' // Default for now
        }
      };

    } catch (error) {
      logger.error('Location validation error', {
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Location validation failed'
      };
    }
  }

  /**
   * Bank Details Validation - Comprehensive with Nigerian bank support
   */
  public validateBankDetails(input: string, donorName: string): {
    isValid: boolean;
    error?: string;
    normalizedData?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  } {
    try {
      // List of supported Nigerian banks
      const SUPPORTED_BANKS = [
        'ACCESS BANK', 'GTBANK', 'ZENITH BANK', 'UBA', 'FIRST BANK',
        'FIDELITY BANK', 'UNION BANK', 'STANBIC IBTC', 'ECOBANK',
        'STERLING BANK', 'WEMA BANK', 'POLARIS BANK', 'FCMB',
        'HERITAGE BANK', 'JAIZ BANK', 'KUDA', 'RUBIES', 'MONIEpoint'
      ];

      //parse bank details from message
      const lines = input.split('\n').map(line => line.trim());
      let bankName = '';
      let accountNumber = '';
      let accountName = '';

      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('bank name:') || lowerLine.includes('bank:')) {
          bankName = line.split(':')[1]?.trim() || '';
        } else if (lowerLine.includes('account number:') || lowerLine.includes('account no:') || lowerLine.includes('account:')) {
          accountNumber = line.split(':')[1]?.trim() || '';
        } else if (lowerLine.includes('account name:') || lowerLine.includes('name:')) {
          accountName = line.split(':')[1]?.trim() || '';
        }
      });

      // If parsing failed, try to extract from free text
      if (!bankName || !accountNumber || !accountName) {
        const parts = input.split(/[\n,]/).map(part => part.trim());
        parts.forEach(part => {
          if (!bankName && SUPPORTED_BANKS.some(bank => part.toUpperCase().includes(bank))) {
            bankName = part;
          } else if (!accountNumber && /^\d{10}$/.test(part)) {
            accountNumber = part;
          } else if (!accountName && part.length > 2 && /^[a-zA-Z\s]+$/.test(part)) {
            accountName = part;
          }
        });
      }

      if (!bankName) {
        return {
          isValid: false,
          error: 'Bank name is required'
        };
      }

      const normalizedBankName = bankName.toUpperCase();
      const isValidBank = SUPPORTED_BANKS.some(bank => 
        normalizedBankName.includes(bank)
      );

      if (!isValidBank) {
        return {
          isValid: false,
          error: `Bank not supported. We support: ${SUPPORTED_BANKS.slice(0, 5).join(', ')} and others.`
        };
      }

      if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
        return {
          isValid: false,
          error: 'Account number must be exactly 10 digits'
        };
      }

      if (!accountName || accountName.length < 2) {
        return {
          isValid: false,
          error: 'Account name must be at least 2 characters'
        };
      }

      //normalize bank name to standard format
      const standardBankName = SUPPORTED_BANKS.find(bank => 
        normalizedBankName.includes(bank)
      ) || normalizedBankName;

      return {
        isValid: true,
        normalizedData: {
          bankName: standardBankName,
          accountNumber,
          accountName: accountName.toUpperCase()
        }
      };

    } catch (error) {
      logger.error('Bank details validation error', {
        input,
        donorName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Bank details validation failed. Please use the format: Bank Name: [Your Bank], Account Number: [10 digits], Account Name: [Your Name]'
      };
    }
  }

  public validateGovernmentId(mediaUrl: string): {
    isValid: boolean;
    error?: string;
  } {
    try {
      if (!mediaUrl) {
        return {
          isValid: false,
          error: 'No document provided. Please send a photo of your government ID.'
        };
      }

      //basic URL validation
      const urlSchema = z.string().url('Invalid document URL');
      const result = urlSchema.safeParse(mediaUrl);
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Invalid document URL. Please send a clear photo.'
        };
      }

      //check if it's a common image hosting service (basic check)
      const allowedDomains = ['drive.google.com', 'dropbox.com', 'icloud.com', 'whatsapp'];
      const hasAllowedDomain = allowedDomains.some(domain => 
        mediaUrl.toLowerCase().includes(domain)
      );

      if (!hasAllowedDomain) {
        logger.warn('Unusual document URL domain', { mediaUrl });
        //we still allow it but log for monitoring
      }

      return {
        isValid: true
      };

    } catch (error) {
      logger.error('Government ID validation error', {
        mediaUrl: mediaUrl?.substring(0, 100), //log partial URL
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Document validation failed. Please try again.'
      };
    }
  }

  public validatePhoneNumber(phoneNumber: string): {
    isValid: boolean;
    error?: string;
    normalizedValue?: string;
  } {
    try {
      const phoneSchema = z.string()
        .regex(/^\+\d{10,15}$/, 'Phone number must be in E.164 format (e.g., +2348012345678)');

      const result = phoneSchema.safeParse(phoneNumber);
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Invalid phone number format'
        };
      }

      return {
        isValid: true,
        normalizedValue: result.data
      };

    } catch (error) {
      logger.error('Phone number validation error', {
        phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        error: 'Phone number validation failed'
      };
    }
  }
}