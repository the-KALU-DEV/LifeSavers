import { DonorSession, StepHandlerResponse } from '../../types/donor.types';
import { 
  REGISTRATION_STEPS,
  ERROR_MESSAGES,
  MEDICAL_MESSAGES,
  BANK_MESSAGES,
  ID_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../utils/constants';
import { EligibilityService } from './donorEligibilityService';
import { ValidationService } from './donorValidationService';
import { logger } from '../../utils/logger';

export class StepHandlers {
  private validationService = new ValidationService();

  public async handleInitialStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
    //move directly to name collection
    return await this.handleNameStep(session, message);
  }

  public async handleNameStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
    try {
      logger.debug('Processing name step', {
        phoneNumber: session.phoneNumber,
        input: message
      });

      //validate name
      const validation = this.validationService.validateName(message);
      if (!validation.isValid) {
        return {
          message: `❌ ${validation.error}\n\nPlease provide your full name:`
        };
      }

      //update session data
      const updatedData = { name: validation.normalizedValue! };

      logger.info('Name collected successfully', {
        phoneNumber: session.phoneNumber,
        name: updatedData.name
      });

      return {
        message: `✅ Thanks, ${updatedData.name}! ❤️\n\nWhat's your blood type?\n\nA) A+     B) A-\nC) B+     D) B-\nE) O+     F) O-\nG) AB+    H) AB-\n\nReply with A-H:`,
        nextStep: REGISTRATION_STEPS.BLOOD_TYPE,
        shouldSave: true,
        updatedData
      };

    } catch (error) {
      logger.error('Error in name step handler', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  public async handleBloodTypeStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
    try {
      const input = message.trim().toUpperCase();

      logger.debug('Processing blood type step', {
        phoneNumber: session.phoneNumber,
        input
      });

      //validate blood type selection
      const validation = this.validationService.validateBloodType(input);
      if (!validation.isValid) {
        return {
          message: `❌ ${validation.error}\n\nA) A+     B) A-\nC) B+     D) B-\nE) O+     F) O-\nG) AB+    H) AB-\n\nReply A-H:`
        };
      }

      const updatedData = { bloodType: validation.normalizedValue! };

      logger.info('Blood type collected', {
        phoneNumber: session.phoneNumber,
        bloodType: updatedData.bloodType
      });

      return {
        message: `✅ Blood Type: ${updatedData.bloodType}\n\n🧬 What's your genotype?\n\nA) AA\nB) AS  \nC) AC\nD) SS\n\nReply A-D:`,
        nextStep: REGISTRATION_STEPS.GENOTYPE,
        shouldSave: true,
        updatedData
      };

    } catch (error) {
      logger.error('Error in blood type step handler', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  public async handleGenotypeStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
    try {
      const input = message.trim().toUpperCase();

      logger.debug('Processing genotype step', {
        phoneNumber: session.phoneNumber,
        input
      });

      //validate genotype selection
      const validation = this.validationService.validateGenotype(input);
      if (!validation.isValid) {
        return {
          message: `❌ ${validation.error}\n\nA) AA\nB) AS  \nC) AC\nD) SS\n\nReply A-D:`
        };
      }

      const updatedData = { genotype: validation.normalizedValue! };

      logger.info('Genotype collected', {
        phoneNumber: session.phoneNumber,
        genotype: updatedData.genotype
      });

      return {
        message: MEDICAL_MESSAGES.SCREENING_PROMPT,
        nextStep: REGISTRATION_STEPS.MEDICAL_SCREENING,
        shouldSave: true,
        updatedData
      };

    } catch (error) {
      logger.error('Error in genotype step handler', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  public async handleMedicalScreeningStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
  try {
    const input = message.trim().toLowerCase();

    logger.debug('Processing medical screening step', {
      phoneNumber: session.phoneNumber,
      input
    });

    let medicalData;
    
    //check if we need detailed medical information
    if (input === 'yes' || input === 'y') {
      return {
        message: MEDICAL_MESSAGES.DETAILED_SCREENING
      };
    }

    //validate basic medical response
    const validation = this.validationService.validateMedicalResponse(input);
    if (!validation.isValid) {
      return {
        message: `❌ ${validation.error}\n\n${MEDICAL_MESSAGES.SCREENING_PROMPT}`
      };
    }

    medicalData = {
      ...validation.normalizedData!,
      lastMedicalCheck: new Date()
    };

    const eligibility = EligibilityService.checkEligibilityPartial({
      bloodType: session.donorData.bloodType!,
      genotype: session.donorData.genotype!,
      hivStatus: medicalData.hivStatus,
      hepatitisBStatus: medicalData.hepatitisBStatus,
      hepatitisCStatus: medicalData.hepatitisCStatus,
      lastMedicalCheck: medicalData.lastMedicalCheck,
      location: session.donorData.location
    });

    logger.info('Medical screening completed', {
      phoneNumber: session.phoneNumber,
      hivStatus: medicalData.hivStatus,
      hepatitisBStatus: medicalData.hepatitisBStatus,
      hepatitisCStatus: medicalData.hepatitisCStatus
    });

    return {
      message: `✅ Medical screening completed!\n\n📍 Now, which city and state are you located in?\n\nExample:\nLagos, Nigeria\nor\nAbuja, FCT`,
      nextStep: REGISTRATION_STEPS.LOCATION,
      shouldSave: true,
      updatedData: medicalData
    };

  } catch (error) {
    logger.error('Error in medical screening step handler', {
      phoneNumber: session.phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return {
      message: ERROR_MESSAGES.SYSTEM_ERROR
    };
  }
}

  public async handleLocationStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
    try {
      logger.debug('Processing location step', {
        phoneNumber: session.phoneNumber,
        input: message
      });

      //validate location format
      const validation = this.validationService.validateLocation(message);
      if (!validation.isValid) {
        return {
          message: `❌ ${validation.error}\n\nPlease provide your city and state:\n\nExample: "Lagos, Nigeria" or "Abuja, FCT"`
        };
      }

      const updatedData = { 
        location: {
          address: validation.normalizedData!.city,
          city: validation.normalizedData!.city,
          state: validation.normalizedData!.state,
          country: validation.normalizedData!.country
        }
      };

      logger.info('Location collected', {
        phoneNumber: session.phoneNumber,
        city: updatedData.location.city,
        state: updatedData.location.state
      });

      return {
        message: BANK_MESSAGES.PROMPT(session.donorData.name!),
        nextStep: REGISTRATION_STEPS.BANK_DETAILS,
        shouldSave: true,
        updatedData
      };

    } catch (error) {
      logger.error('Error in location step handler', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  public async handleBankDetailsStep(session: DonorSession, message: string): Promise<StepHandlerResponse> {
    try {
      logger.debug('Processing bank details step', {
        phoneNumber: session.phoneNumber,
        inputLength: message.length
      });

      //validate bank details
      const validation = this.validationService.validateBankDetails(message, session.donorData.name!);
      if (!validation.isValid) {
        return {
          message: BANK_MESSAGES.VALIDATION_ERROR([validation.error!])
        };
      }

      const updatedData = { bankAccount: validation.normalizedData! };

      logger.info('Bank details collected', {
        phoneNumber: session.phoneNumber,
        bankName: updatedData.bankAccount.bankName,
        accountNumber: '***' + updatedData.bankAccount.accountNumber.slice(-4)
      });

      return {
        message: ID_MESSAGES.PROMPT,
        nextStep: REGISTRATION_STEPS.ID_VERIFICATION,
        shouldSave: true,
        updatedData
      };

    } catch (error) {
      logger.error('Error in bank details step handler', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  public async handleIdVerificationStep(
    session: DonorSession, 
    message: string, 
    mediaUrl?: string
  ): Promise<StepHandlerResponse> {
    try {
      logger.debug('Processing ID verification step', {
        phoneNumber: session.phoneNumber,
        hasMedia: !!mediaUrl,
        message
      });

      //check if media was provided
      if (!mediaUrl) {
        return {
          message: ID_MESSAGES.RETRY
        };
      }

      //validate the document
      const validation = this.validationService.validateGovernmentId(mediaUrl);
      if (!validation.isValid) {
        return {
          message: `❌ ${validation.error}\n\n${ID_MESSAGES.PROMPT}`
        };
      }

      const updatedData = {
        governmentId: {
          type: 'national_id', //our default type
          number: 'pending_verification',
          imageUrl: mediaUrl,
          verified: false
        }
      };

      logger.info('ID document received', {
        phoneNumber: session.phoneNumber,
        mediaUrl: mediaUrl.substring(0, 100) + '...'
      });

      //registration complete!
      return {
        message: SUCCESS_MESSAGES.REGISTRATION_COMPLETE('Pending', session.donorData.name!),
        nextStep: REGISTRATION_STEPS.COMPLETE,
        shouldSave: true,
        updatedData,
        isComplete: true
      };

    } catch (error) {
      logger.error('Error in ID verification step handler', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }
}