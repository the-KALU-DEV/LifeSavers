export enum UserRole {
    DONOR = "donor",
    RECIPIENT = "recipient",
    ADMIN = "admin",
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

export enum VerificationStep {
    ASK_NIN = "ask_nin",
    ASK_SELFIE = "ask_selfie",
    ASK_ID = "ask_id",
    ASK_BANK = "ask_bank",
    COMPLETE = "complete",
    VERIFICATION_FAILED = "verification_failed",
}
