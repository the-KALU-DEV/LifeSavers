import axios from 'axios';
import {
  CACLookupPayload,
  CACLookupResponse,
  CACVerificationResult
} from '../../types/cac.types';
import { ZEEH_PRODUCTION_URL, ZEEH_SECRET_KEY } from '../../config/env';
import { API_CONSTANTS } from '../../utils/constants';

export class ZeehCACService {
  private static instance: ZeehCACService;
  private readonly baseURL: string | undefined;
  private readonly secretKey: string;

  private constructor() {
    this.baseURL = ZEEH_PRODUCTION_URL;
    this.secretKey = ZEEH_SECRET_KEY!;
    
    if (!this.secretKey) {
      throw new Error('ZEEH_SECRET_KEY is required');
    }
  }

  public static getInstance(): ZeehCACService {
    if (!ZeehCACService.instance) {
      ZeehCACService.instance = new ZeehCACService();
    }
    return ZeehCACService.instance;
  }

  async verifyCAC(rcNumber: string, companyName: string): Promise<CACVerificationResult> {
    try {
      console.log('Starting CAC verification', { rcNumber, companyName });

      if (!rcNumber?.trim() || !companyName?.trim()) {
        return {
          success: false,
          verified: false,
          error: 'RC Number and Hospital Name are required'
        };
      }

      const payload: CACLookupPayload = {
        rc_number: rcNumber.trim(),
        company_name: companyName.trim()
      };

      const response = await axios.post<CACLookupResponse>(
        `${this.baseURL}/nigeria_kyc/lookup_cac`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Secret_Key': this.secretKey
          },
          timeout: 15000
        }
      );

      return this.processResponse(response.data);

    } catch (error: any) {
      console.error('CAC Verification failed:', error);
      
      return {
        success: false,
        verified: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  private processResponse(response: CACLookupResponse): CACVerificationResult {
    if (!response.success || response.response_code !== '00') {
      return {
        success: false,
        verified: false,
        error: response.message || 'CAC verification failed'
      };
    }

    if (!response.data || response.data.length === 0) {
      return {
        success: true,
        verified: false,
        message: 'No hospital with the provided details found'
      };
    }

    const activeCompanies = response.data.filter(company => 
      company.companyStatus === 'ACTIVE' || company.status === 'ACTIVE'
    );

    const verified = activeCompanies.length > 0;

    return {
      success: true,
      verified,
      data: response.data,
      message: verified ? 'Hospital verification successful' : 'Hospital found but not active'
    };
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.code === API_CONSTANTS.HTTP_STATUS.ECONNABORTED) {
      return API_CONSTANTS.ERROR_MESSAGES.VERIFICATION_TIMEOUT;
    }
    
    if (error.response?.status === API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
      return API_CONSTANTS.ERROR_MESSAGES.INVALID_API_CREDENTIALS;
    }
    
    return API_CONSTANTS.ERROR_MESSAGES.CAC_VERIFICATION_UNAVAILABLE;
  }
}