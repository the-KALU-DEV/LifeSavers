export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodGenotype = 'AA' | 'AS' | 'SS' | 'AC';
export type HIVStatus = 'negative' | 'positive' | 'unknown';
export type HepatitisStatus = 'negative' | 'positive' | 'immune' | 'unknown';
export type DonorStatus = 'pending' | 'active' | 'inactive' | 'suspended';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'temporary_ineligible';

export type RegistrationStep = 
  | 'initial'
  | 'name'
  | 'blood_type' 
  | 'genotype'
  | 'medical_screening'
  | 'location'
  | 'bank_details'
  | 'id_verification'
  | 'complete';

export interface RegistrationResponse {
  message: string;
  nextStep?: RegistrationStep;
  isComplete?: boolean;
}

export interface ProcessMessageParams {
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
}

export interface DonorSession {
  phoneNumber: string;
  currentStep: RegistrationStep;
  donorId?: string;
  donorData: Partial<{
    name: string;
    bloodType: BloodType;
    genotype: BloodGenotype;
    hivStatus: HIVStatus;
    hepatitisBStatus: HepatitisStatus;
    hepatitisCStatus: HepatitisStatus;
    lastMedicalCheck: Date;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
    bankAccount: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    governmentId: {
      type: string;
      number: string;
      imageUrl: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;       
}

export interface DonorRegistrationData {
  name: string;
  bloodType: BloodType;
  genotype: BloodGenotype;
  hivStatus: HIVStatus;
  hepatitisBStatus: HepatitisStatus;
  hepatitisCStatus: HepatitisStatus;
  lastMedicalCheck: Date;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  governmentId: {
    type: string;
    number: string;
    imageUrl: string;
    verified: boolean;
  };
}

export interface StepHandlerResponse {
  message: string;
  nextStep?: RegistrationStep;
  shouldSave?: boolean;
  updatedData?: Partial<DonorRegistrationData>;
  isComplete?: boolean;
}