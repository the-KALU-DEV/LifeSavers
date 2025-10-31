import { DonorSessionManager } from './donorSessionManager';
import { StepHandlers } from './donorRegistrationStepHandlers';
import { EligibilityService } from './donorEligibilityService';
import Donor from '../../models/Donor';
import { 
  ProcessMessageParams, 
  DonorSession, 
  StepHandlerResponse 
} from '../../types/donor.types';
import { 
  REGISTRATION_STEPS,
  ERROR_MESSAGES, 
  WELCOME_MESSAGES,
  SUCCESS_MESSAGES 
} from '../../utils/constants';
import { AppError } from '../../utils/error';
import { logger } from '../../utils/logger';

export class DonorService {
  private static sessionManager = new DonorSessionManager();
  private static stepHandlers = new StepHandlers();

  public static async processMessage(params: ProcessMessageParams): Promise<string> {
    try {
      const { phoneNumber, message, mediaUrl } = params;
      
      logger.info('Processing donor message', {
        phoneNumber,
        messageLength: message.length,
        hasMedia: !!mediaUrl,
        step: 'start'
      });

      //clean phone number
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      
      //check if donor already exists and registration is complete
      const existingDonor = await this.getExistingDonor(cleanPhone);
      if (existingDonor?.isRegistrationComplete) {
        return this.handleActiveDonor(existingDonor, message);
      }

      //get or create session for registration
      let session = await this.sessionManager.getSession(cleanPhone);
      
      //handle new user or registration start
      if (!session) {
        return this.handleNewUser(cleanPhone, message);
      }

      //process current registration step
      const result = await this.processStep(session, message, mediaUrl);
      
      //update session with step progress
      if (result.nextStep || result.shouldSave) {
        session = await this.sessionManager.updateSession(cleanPhone, {
          currentStep: result.nextStep || session.currentStep,
          donorData: { ...session.donorData, ...result.updatedData },
          updatedAt: new Date()
        });
      }

      //complete registration if finished
      if (result.isComplete && session.donorId) {
        await this.completeRegistration(session);
        
        logger.info('Registration completed successfully', {
          phoneNumber: session.phoneNumber,
          donorId: session.donorId,
          stepsCompleted: Object.keys(session.donorData).length
        });
      }

      logger.info('Registration step processed', {
        phoneNumber,
        currentStep: session.currentStep,
        nextStep: result.nextStep,
        isComplete: result.isComplete
      });

      return result.message;

    } catch (error) {
      logger.error('Donor service processing error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        phoneNumber: params.phoneNumber,
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof AppError) {
        return error.message;
      }

      return ERROR_MESSAGES.SYSTEM_ERROR;
    }
  }

  private static cleanPhoneNumber(phone: string): string {
    try {
      //remove 'whatsapp:' prefix and non-digit characters
      const cleanPhone = phone.replace('whatsapp:', '').replace(/\D/g, '');
      
      if (!cleanPhone || cleanPhone.length < 10) {
        throw new AppError('Invalid phone number format', 400);
      }

      //ensure E.164 format with country code
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
      
      //basic validation for Nigerian numbers (you can expand this)
      if (!/^\+\d{10,15}$/.test(formattedPhone)) {
        throw new AppError('Phone number must be in valid international format', 400);
      }

      return formattedPhone;
    } catch (error) {
      logger.error('Phone number cleaning error', {
        originalPhone: phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private static async getExistingDonor(phoneNumber: string): Promise<any> {
    try {
      const donor = await Donor.findOne({ phoneNumber });
      
      if (donor) {
        logger.debug('Existing donor found', {
          phoneNumber,
          donorId: donor.donorId,
          registrationComplete: donor.status === 'active'
        });
      }

      return donor;
    } catch (error) {
      logger.error('Error checking existing donor', {
        phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  //for registered active donors
  private static async handleActiveDonor(donor: any, message: string): Promise<string> {
    const normalizedMessage = message.toLowerCase().trim();

    logger.info('Handling active donor message', {
      donorId: donor.donorId,
      message: normalizedMessage
    });

    switch (normalizedMessage) {
      case 'status':
      case 'profile':
        return this.getDonorStatus(donor);
      
      case 'help':
      case 'menu':
        return this.getHelpMenu(donor);
      
      case 'update':
      case 'edit':
        return '🔄 Profile update feature coming soon! Use the web portal for now.';
      
      case 'donate':
      case 'available':
        return this.handleAvailabilityUpdate(donor, true);
      
      case 'busy':
      case 'unavailable':
        return this.handleAvailabilityUpdate(donor, false);
      
      case 'history':
      case 'donations':
        return this.getDonationHistory(donor);
      
      default:
        return this.handleGeneralMessage(donor, normalizedMessage);
    }
  }

  private static getDonorStatus(donor: any): string {
    const maskedAccount = donor.bankAccount?.accountNumber 
      ? `******${donor.bankAccount.accountNumber.slice(-4)}`
      : 'Not provided';

    let status = `🩸 DONOR STATUS\n\n`;
    status += `👤 ${donor.name}\n`;
    status += `🆔 ${donor.donorId}\n`;
    status += `💉 ${donor.bloodType} Blood\n`;
    status += `🧬 ${donor.genotype} Genotype\n`;
    status += `📍 ${donor.location.city}, ${donor.location.state}\n`;
    status += `🏥 Medical: ${donor.eligibilityStatus.toUpperCase()}\n`;
    status += `📊 Donations: ${donor.totalDonations || 0}\n`;
    status += `🟢 Available: ${donor.isAvailable ? 'YES' : 'NO'}\n`;
    
    if (donor.bankAccount) {
      status += `🏦 ${donor.bankAccount.bankName}\n`;
      status += `🔢 ${maskedAccount}\n`;
    }
    
    if (donor.ineligibilityReason) {
      status += `\n⚠️ Note: ${donor.ineligibilityReason}\n`;
    }
    
    status += `\nThank you for being a LifeSaver! 💝`;
    
    return status;
  }

  private static getHelpMenu(donor: any): string {
    return `🩸 LIFESAVERS HELP MENU\n\nAvailable commands:\n\n• status - Your donor profile\n• donate - Mark yourself as available\n• busy - Mark yourself as unavailable\n• history - Your donation records\n• update - Change your information\n• help - Show this menu\n\nNeed assistance? Contact support at support@lifesavers.ng`;
  }

  private static async handleAvailabilityUpdate(donor: any, isAvailable: boolean): Promise<string> {
    try {
      await Donor.findByIdAndUpdate(donor._id, { 
        isAvailable,
        updatedAt: new Date()
      });

      logger.info('Donor availability updated', {
        donorId: donor.donorId,
        isAvailable
      });

      return isAvailable 
        ? `✅ You're now available to donate! We'll notify you when your blood type is needed.`
        : `⏸️ You're marked as busy. You won't receive donation requests until you're available again.`;

    } catch (error) {
      logger.error('Error updating donor availability', {
        donorId: donor.donorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return '❌ Failed to update availability. Please try again.';
    }
  }

  private static getDonationHistory(donor: any): string {
    const donationCount = donor.totalDonations || 0;
    
    if (donationCount === 0) {
      return `📊 DONATION HISTORY\n\nYou haven't made any donations yet.\n\nWhen you donate blood through our system, your donation history will appear here.`;
    }
    
    return `📊 DONATION HISTORY\n\nTotal Donations: ${donationCount}\nLast Donation: ${donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}\n\nThank you for your ${donationCount} life-saving donation${donationCount > 1 ? 's' : ''}! ❤️`;
  }

  private static handleGeneralMessage(donor: any, message: string): string {
    //handle common greetings and questions
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello ${donor.name}! 👋 Ready to save lives today? Type "help" to see available commands.`;
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return `You're welcome, ${donor.name}! ❤️ Thank YOU for being a blood donor and helping save lives.`;
    }
    
    if (message.includes('blood') && message.includes('need')) {
      return `We'll notify you when patients need ${donor.bloodType} blood in ${donor.location.city}. Make sure you're marked as "available"!`;
    }
    
    if (message.includes('where') || message.includes('location')) {
      return `Your registered location: ${donor.location.city}, ${donor.location.state}. To update your location, use our web portal.`;
    }

    //default response for unrecognized messages
    logger.info('Unrecognized message from active donor', {
      donorId: donor.donorId,
      message
    });

    return `Hello ${donor.name}! I'm not sure how to help with that. Type "help" to see available commands, or contact support for assistance.`;
  }

  //handle new donor - initial message and registration start
  private static handleNewUser(phoneNumber: string, message: string): string {
    const normalizedMessage = message.toLowerCase().trim();

    //check if donor wants to register
    if (normalizedMessage === '1' || normalizedMessage.includes('donor')) {
      //create session and start registration
      this.sessionManager.createSession(phoneNumber);
      return WELCOME_MESSAGES.REGISTRATION_START;
    }

    // Check if donor wants to learn more
    if (normalizedMessage === '3' || normalizedMessage.includes('learn')) {
      return WELCOME_MESSAGES.DONOR_GUIDE;
    }

    //check if donor is returning but session expired
    if (normalizedMessage.includes('register') || normalizedMessage.includes('signup')) {
      this.sessionManager.createSession(phoneNumber);
      return WELCOME_MESSAGES.REGISTRATION_START;
    }

    //handle common greetings
    if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi') || normalizedMessage.includes('hey')) {
      return WELCOME_MESSAGES.GREETING;
    }

    //default welcome message for first interaction
    return WELCOME_MESSAGES.GREETING;
  }

  private static async processStep(
    session: DonorSession, 
    message: string, 
    mediaUrl?: string
  ): Promise<StepHandlerResponse> {
    const { currentStep } = session;

    logger.debug('Processing registration step', {
      phoneNumber: session.phoneNumber,
      currentStep,
      messageLength: message.length,
      hasMedia: !!mediaUrl
    });

    try {
      switch (currentStep) {
        case REGISTRATION_STEPS.INITIAL:
          return await this.stepHandlers.handleInitialStep(session, message);
        
        case REGISTRATION_STEPS.NAME:
          return await this.stepHandlers.handleNameStep(session, message);
        
        case REGISTRATION_STEPS.BLOOD_TYPE:
          return await this.stepHandlers.handleBloodTypeStep(session, message);
        
        case REGISTRATION_STEPS.GENOTYPE:
          return await this.stepHandlers.handleGenotypeStep(session, message);
        
        case REGISTRATION_STEPS.MEDICAL_SCREENING:
          return await this.stepHandlers.handleMedicalScreeningStep(session, message);
        
        case REGISTRATION_STEPS.LOCATION:
          return await this.stepHandlers.handleLocationStep(session, message);
        
        case REGISTRATION_STEPS.BANK_DETAILS:
          return await this.stepHandlers.handleBankDetailsStep(session, message);
        
        case REGISTRATION_STEPS.ID_VERIFICATION:
          return await this.stepHandlers.handleIdVerificationStep(session, message, mediaUrl);
        
        default:
          logger.warn('Unknown registration step', { currentStep });
          return {
            message: ERROR_MESSAGES.SYSTEM_ERROR
          };
      }
    } catch (error) {
      logger.error('Step processing error', {
        phoneNumber: session.phoneNumber,
        currentStep,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        message: ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  private static async completeRegistration(session: DonorSession): Promise<void> {
    try {
      //validate all required data is present
      if (!this.isRegistrationDataComplete(session.donorData)) {
        throw new AppError('Registration data incomplete', 400);
      }

      //generate donor id
      const sequence = await this.getNextDonorSequence(session.donorData.location!.city);
      const donorId = EligibilityService.generateDonorId(session.donorData.location!.city, sequence);

      //check final eligibility
      const eligibility = EligibilityService.checkEligibilityPartial({
        bloodType: session.donorData.bloodType!, // ✅ Use donorData and assert non-null
        genotype: session.donorData.genotype!,
        hivStatus: session.donorData.hivStatus!,
        hepatitisBStatus: session.donorData.hepatitisBStatus!,
        hepatitisCStatus: session.donorData.hepatitisCStatus!,
        lastMedicalCheck: session.donorData.lastMedicalCheck!,
        location: session.donorData.location
      });
      
      //create donor document
      const donorData = {
        ...session.donorData,
        donorId,
        phoneNumber: session.phoneNumber,
        age: eligibility.age!,
        eligibilityStatus: eligibility.eligibilityStatus,
        ineligibilityReason: eligibility.ineligibilityReason,
        status: eligibility.eligibilityStatus === 'eligible' ? 'active' : 'pending',
        isRegistrationComplete: true,
        registrationStep: REGISTRATION_STEPS.COMPLETE
      };

      const donor = await Donor.create(donorData);

      //update session with donor id
      session.donorId = donor.id.toString();

      //clear session after successful registration
      await this.sessionManager.clearSession(session.phoneNumber);

      logger.info('Donor registration completed successfully', {
        phoneNumber: session.phoneNumber,
        donorId: donor.donorId,
        bloodType: donor.bloodType,
        eligibilityStatus: donor.eligibilityStatus,
        city: donor.location.city
      });

    } catch (error) {
      logger.error('Error completing donor registration', {
        phoneNumber: session.phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        dataFields: Object.keys(session.donorData)
      });
      
      //dont clear session on error - allow retry
      throw error;
    }
  }

  private static async getNextDonorSequence(city: string): Promise<number> {
    //for now we use random sequence. during production, we can implement a proper sequence counter
    return Math.floor(Math.random() * 900) + 100;
  }

  private static isRegistrationDataComplete(data: Partial<DonorSession['donorData']>): boolean {
  const requiredFields = [
    'name', 'bloodType', 'genotype', 'hivStatus', 
    'hepatitisBStatus', 'hepatitisCStatus', 'lastMedicalCheck',
    'location', 'bankAccount', 'governmentId'
  ] as const;

  return requiredFields.every(field => {
    const value = data[field];
    
    if (value === undefined || value === null) return false;
    
    //check nested objects with proper type guards
    if (typeof value === 'object' && !(value instanceof Date)) {
      //type guard for location
      if (field === 'location' && 'city' in value && 'state' in value) {
        return !!(value.city && value.state);
      }
      //type guard for bankAccount
      if (field === 'bankAccount' && 'bankName' in value && 'accountNumber' in value && 'accountName' in value) {
        return !!(value.bankName && value.accountNumber && value.accountName);
      }
      //type guard for governmentId
      if (field === 'governmentId' && 'imageUrl' in value) {
        return !!(value.imageUrl);
      }
    }
    
    //for non-object fields and date fields
    return true;
  });
}

  public static async getDonorByPhone(phoneNumber: string): Promise<any> {
    try {
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      return await Donor.findOne({ phoneNumber: cleanPhone });
    } catch (error) {
      logger.error('Error getting donor by phone', {
        phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  public static async updateDonor(donorId: string, updates: any): Promise<boolean> {
    try {
      await Donor.findByIdAndUpdate(donorId, {
        ...updates,
        updatedAt: new Date()
      });
      
      logger.info('Donor updated successfully', { donorId, updates: Object.keys(updates) });
      return true;
    } catch (error) {
      logger.error('Error updating donor', {
        donorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  public static async getEligibleDonors(bloodType: string, city: string, state: string): Promise<any[]> {
    try {
      const donors = await Donor.find({
        bloodType,
        'location.city': { $regex: city, $options: 'i' },
        'location.state': { $regex: state, $options: 'i' },
        eligibilityStatus: 'eligible',
        isAvailable: true,
        status: 'active'
      }).select('name phoneNumber donorId location');

      logger.debug('Found eligible donors', {
        bloodType,
        city,
        state,
        count: donors.length
      });

      return donors;
    } catch (error) {
      logger.error('Error finding eligible donors', {
        bloodType,
        city,
        state,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }
}