import { IDonor } from '../../models/Donor';
import { BloodGenotype, BloodType, EligibilityStatus, HepatitisStatus, HIVStatus } from '../../types/donor.types';
import { DONATION_COOLDOWN_DAYS, MIN_DONOR_AGE, MAX_DONOR_AGE } from '../../utils/constants';
import { logger } from '../../utils/logger';

export interface EligibilityResult {
  eligibilityStatus: EligibilityStatus;
  ineligibilityReason?: string;
  age?: number;
  isPermanentlyIneligible: boolean;
  donorId?: string;
}

export class EligibilityService {
  public static generateDonorId(city: string, sequence: number): string {
    try {
      const cityCode = city.toUpperCase().substring(0, 3);
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const sequencePart = sequence.toString().padStart(3, '0');
      
      return `DON-${cityCode}-${sequencePart}-${randomSuffix}`;
    } catch (error) {
      logger.error('Donor ID generation error', { error, city, sequence });
      //donor id creation (e.g., DON-LAGOS-659-082)
      return `DON-${Date.now().toString().slice(-6)}`;
    }
  }

  public static verifyAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

//   public static checkEligibility(donorData: Partial<IDonor>): EligibilityResult {
//     let age: number | undefined;
//     const reasons: string[] = [];

//     if (donorData.dateOfBirth) {
//       age = this.calculateAge(donorData.dateOfBirth);
      
//       if (age < MIN_DONOR_AGE) {
//         reasons.push(`Must be at least ${MIN_DONOR_AGE} years old`);
//       }
      
//       if (age > MAX_DONOR_AGE) {
//         reasons.push(`Maximum donor age is ${MAX_DONOR_AGE}`);
//       }
//     } else {
//       reasons.push('Date of birth is required');
//     }

//     //medical conditions that make up permanent ineligibility
//     if (donorData.hivStatus === 'positive') {
//       reasons.push('HIV positive status');
//     }

//     if (donorData.hepatitisBStatus === 'positive') {
//       reasons.push('Hepatitis B positive status');
//     }

//     if (donorData.hepatitisCStatus === 'positive') {
//       reasons.push('Hepatitis C positive status');
//     }

//     if (donorData.genotype === 'SS') {
//       reasons.push('SS genotype (sickle cell disease)');
//     }

//     if (donorData.hasChronicIllness) {
//       reasons.push('Chronic illness that prevents donation');
//     }

//     //temporary ineligibility on donation cooldown
//     if (donorData.cooldownUntil && new Date() < new Date(donorData.cooldownUntil)) {
//       const cooldownDate = new Date(donorData.cooldownUntil).toLocaleDateString();
//       reasons.push(`Recent donation - eligible after ${cooldownDate}`);
//     }

//     //determine eligibility status
//     const hasPermanentConditions = reasons.some(reason => 
//       reason.includes('HIV') || 
//       reason.includes('Hepatitis') || 
//       reason.includes('genotype') ||
//       reason.includes('Chronic illness')
//     );

//     const hasTemporaryConditions = reasons.some(reason => 
//       reason.includes('age') || 
//       reason.includes('Recent donation') ||
//       reason.includes('Date of birth')
//     );

//     let eligibilityStatus: EligibilityStatus = 'eligible';
//     if (hasPermanentConditions) {
//       eligibilityStatus = 'ineligible';
//     } else if (hasTemporaryConditions) {
//       eligibilityStatus = 'temporary_ineligible';
//     }

//     //generate the donor ID if we have location data
//     let donorId: string | undefined;
//     if (donorData.location?.city) {
//       //in production, we'd get the sequence from our database
//       const sequence = Math.floor(Math.random() * 900) + 100; //our mock sequence
//       donorId = this.generateDonorId(donorData.location.city, sequence);
//     }

//     const result: EligibilityResult = {
//       eligibilityStatus,
//       ineligibilityReason: reasons.length > 0 ? reasons.join('; ') : undefined,
//       age,
//       isPermanentlyIneligible: hasPermanentConditions,
//       donorId
//     };

//     logger.info('Eligibility check completed', {
//       eligibilityStatus: result.eligibilityStatus,
//       age: result.age,
//       isPermanentlyIneligible: result.isPermanentlyIneligible,
//       reasons: reasons
//     });

//     return result;
//   }

  public static checkEligibilityPartial(donorData: {
    bloodType: BloodType;
    genotype: BloodGenotype;
    hivStatus: HIVStatus;
    hepatitisBStatus: HepatitisStatus;
    hepatitisCStatus: HepatitisStatus;
    lastMedicalCheck: Date;
    location?: any;
    dateOfBirth?: Date;
    hasChronicIllness?: boolean;
    cooldownUntil?: Date;
    }): EligibilityResult {
    let age: number | undefined;
    const reasons: string[] = [];

    //age check - only when DOB is provided
    if (donorData.dateOfBirth) {
        age = this.verifyAge(donorData.dateOfBirth);
        
        if (age < MIN_DONOR_AGE) {
        reasons.push(`Must be at least ${MIN_DONOR_AGE} years old`);
        }
        
        if (age > MAX_DONOR_AGE) {
        reasons.push(`Maximum donor age is ${MAX_DONOR_AGE}`);
        }
    }
    // If no DOB, we may not verify age but thats OK for now

    //medical conditions that results permanent ineligibility
    if (donorData.hivStatus === 'positive') {
        reasons.push('HIV positive status');
    }

    if (donorData.hepatitisBStatus === 'positive') {
        reasons.push('Hepatitis B positive status');
    }

    if (donorData.hepatitisCStatus === 'positive') {
        reasons.push('Hepatitis C positive status');
    }

    if (donorData.genotype === 'SS') {
        reasons.push('SS genotype (sickle cell disease)');
    }

    //only check for chronic illness if the data is available and true
    if (donorData.hasChronicIllness === true) {
        reasons.push('Chronic illness that prevents donation');
    }

    //temporary ineligibility equals post-donation cooldown
    if (donorData.cooldownUntil && new Date() < new Date(donorData.cooldownUntil)) {
        const cooldownDate = new Date(donorData.cooldownUntil).toLocaleDateString();
        reasons.push(`Recent donation - eligible after ${cooldownDate}`);
    }

    //determine eligibility status
    const hasPermanentConditions = reasons.some(reason => 
        reason.includes('HIV') || 
        reason.includes('Hepatitis') || 
        reason.includes('genotype') ||
        reason.includes('Chronic illness')
    );

    const hasTemporaryConditions = reasons.some(reason => 
        reason.includes('age') || 
        reason.includes('Recent donation')
    );

    let eligibilityStatus: EligibilityStatus = 'eligible';
    if (hasPermanentConditions) {
        eligibilityStatus = 'ineligible';
    } else if (hasTemporaryConditions) {
        eligibilityStatus = 'temporary_ineligible';
    }

    return {
        eligibilityStatus,
        ineligibilityReason: reasons.length > 0 ? reasons.join('; ') : undefined,
        age,
        isPermanentlyIneligible: hasPermanentConditions
    };
  }
  
  public static calculateCooldownPeriod(lastDonationDate?: Date): Date | undefined {
    if (!lastDonationDate) return undefined;
    
    const cooldownUntil = new Date(lastDonationDate);
    cooldownUntil.setDate(cooldownUntil.getDate() + DONATION_COOLDOWN_DAYS);
    return cooldownUntil;
  }

  public static canUpdateMedicalInfo(currentStatus: EligibilityStatus): boolean {
    return currentStatus === 'temporary_ineligible' || currentStatus === 'ineligible';
  }

  public static getEligibilityMessage(result: EligibilityResult): string {
    switch (result.eligibilityStatus) {
      case 'eligible':
        return `✅ You are eligible to donate blood! ${result.donorId ? `Your donor ID: ${result.donorId}` : ''}`;
      
      case 'temporary_ineligible':
        return `⏳ Temporarily ineligible: ${result.ineligibilityReason}. You can update your information after medical checkup.`;
      
      case 'ineligible':
        return `❌ Unfortunately, you cannot donate blood due to: ${result.ineligibilityReason}. This is for recipient safety.`;
      
      default:
        return '🔄 Eligibility status is being determined.';
    }
  }
}