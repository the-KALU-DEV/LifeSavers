export enum UserRole {
  DONOR = "donor",
  RECIPIENT = "recipient",
  ADMIN = "admin",
  HOSPITAL = "hospital", // Added a new hospital role
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum BloodGroup {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-",
}

export enum Genotype {
  AA = "AA",
  AS = "AS",
  SS = "SS",
  AC = "AC",
  SC = "SC",
}

export enum BotFlow {
  WELCOME = "welcome",
  PICK_REG_FLOW = "pick_reg_flow",
  
  HOSPITALREGISTRATION = "hospital_registration",
  HOSPITALVERIFICATION = "hospital_verification",

  DONORREGISTRATION = "donor_registration",
  DONORVERIFICATION = "donor_verification",
  
  REQUESTACCEPTANCE = "acceptance",
  DONATION = "donation",
  REQUEST = "request",
  MATCHING = "matching",
}

export enum RegistrationStep {
  GET_TYPE = "get_type",
  START = "start",
  ROLE = "role",
  NAME = "name",
  AGE = "age",
  GENDER = "gender",
  BLOOD_GROUP = "blood_group",
  GENOTYPE = "genotype",
  LOCATION = "location",
  CONFIRM = "confirm",
  COMPLETE = "complete",
}

export enum HospitalRegistrationStep {
  START = "start",
  ROLE = "role",
  HOSPITAL_NAME = "hospital_name",
  LICENSE_NUMBER = "license_number",
  CONTACT = "contact",
  ADDRESS = "address",
  ADMIN_NAME = "admin_name",
  ADMIN_PHONE = "admin_phone",
  PICTURES = "pictures",
  COMPLETE = "complete",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum VerificationStep {
    START = "start",
    ASK_NIN = "ask_nin",
    ASK_SELFIE = "ask_selfie",
    ASK_ID = "ask_id",
    ASK_BANK = "ask_bank",
    ASK_CAC = "ask_cac",  
    COMPLETE = "complete",
    VERIFICATION_FAILED = "verification_failed",
}

export enum UrgencyLevel {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  EMERGENCY = "emergency"
}

export enum RequestStatus {
  CREATED = "created",
  ACTIVE = "active",
  PARTIALLY_FULFILLED = "partially_fulfilled", 
  FULFILLED = "fulfilled",
  CANCELLED = "cancelled",
  EXPIRED = "expired"
}

export enum RequestStep {
  START = "start",
  BLOOD_TYPE = "blood_type",
  GENOTYPE = "genotype",
  UNITS_NEEDED = "units_needed",
  URGENCY = "urgency",
  DEADLINE = "deadline",
  CONFIRM = "confirm",
  COMPLETE = "complete",
}

export enum EligibilityStatus {
  PENDING = "pending",
  ELIGIBLE = "eligible",
  TEMPORARILY_ELIGIBLE = "ineligible",
  INELIGIBLE = "permanently_ineligible"
}

export enum AcceptanceStatus {
  PENDING = "pending",
  ACCEPTED = "confirmed", 
  CANCELLED = "cancelled"
}

export enum AcceptanceStep {
  START = "start",
  SELECT_REQUEST = "select_request", 
  PLEDGE_UNITS = "pledge_units",
  CONFIRM_AVAILABILITY = "confirm_availability",
  FINAL_CONFIRM = "final_confirm",
  COMPLETE = "complete"
}