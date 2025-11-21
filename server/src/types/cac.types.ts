export interface CACLookupPayload {
  rc_number: string;
  company_name: string;
}

export interface CACBusiness {
  state: string | null;
  address: string;
  status: string;
  city: string | null;
  email: string | null;
  companyStatus: string;
  lga: string | null;
  rcNumber: string;
  registrationDate: string;
  approvedName: string;
  id: number;
}

export interface CACLookupResponse {
  success: boolean;
  statusCode: number;
  message: string;
  response_code: string;
  data: CACBusiness[];
}

export interface CACVerificationResult {
  success: boolean;
  verified: boolean;
  data?: CACBusiness[];
  error?: string;
  message?: string;
}