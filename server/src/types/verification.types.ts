export interface BaseVerificationContext {
  attempts?: number;
  lastAttemptAt?: Date;
}

export interface DonorVerificationContext extends BaseVerificationContext {
  nin?: string;
  ninResult?: any;
  selfieUrl?: string;
  idUrl?: string;
  faceCompareResult?: any;
}

export interface HospitalVerificationContext extends BaseVerificationContext {
  rcNumber?: string;
  companyName?: string;
  cacData?: any;
}

export type VerificationContext = 
  | DonorVerificationContext 
  | HospitalVerificationContext;

export interface VerificationStepResult {
  success: boolean;
  message: string;
  nextStep?: string;
  data?: any;
}