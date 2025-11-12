export enum UserRole {
    DONOR = "donor",
    RECIPIENT = "recipient",
    ADMIN = "admin",
    HOSPITAL = "hospital",
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
  REGISTRATION = "registration",
  VERIFICATION = "verification",
  DONATION = "donation",
  MATCHING = "matching",
  HOSPITAL_REGISTRATION = "hospital_registration",
}

export enum RegistrationStep {
    START = "start",
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
  HOSPITAL_NAME = "hospital_name",
  LICENSE_NUMBER = "license_number",
  CONTACT = "contact",
  ADDRESS = "address",
  ADMIN_NAME = "admin_name",
  ADMIN_PHONE = "admin_phone",
  PICTURES = "pictures",
  COMPLETE = "complete",
}