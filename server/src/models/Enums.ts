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
 
  DONATION = "donation",
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
