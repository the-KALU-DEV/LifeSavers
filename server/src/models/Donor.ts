import { Schema, model, Document, Types } from 'mongoose';
import { BloodType, BloodGenotype, HIVStatus, HepatitisStatus, EligibilityStatus, DonorStatus } from '../types/donor.types';

export interface IDonor extends Document {

  phoneNumber: string;
  countryCode: string;
  
  donorId: string;
  name: string;
  dateOfBirth: Date;
  age: number; 
  gender?: 'male' | 'female' ;
  
  bloodType: BloodType;
  genotype: BloodGenotype;
  hivStatus: HIVStatus;
  hepatitisBStatus: HepatitisStatus;
  hepatitisCStatus: HepatitisStatus;
  lastMedicalCheck: Date;
  hasChronicIllness: boolean;
  chronicIllnessDetails?: string;
  
  lastDonationDate?: Date;
  totalDonations: number;
  isRegularDonor: boolean;
  eligibilityStatus: EligibilityStatus;
  cooldownUntil?: Date;
  ineligibilityReason?: string;
  
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  
  governmentId: {
    type: 'drivers_license' | 'national_id' | 'passport' | 'voters_card';
    number: string;
    imageUrl: string;
    verified: boolean;
  };
  
  medicalDocuments: {
    hivTestUrl?: string;
    hepatitisBTestUrl?: string;
    hepatitisCTestUrl?: string;
    genotypeTestUrl?: string;
    lastMedicalCheckUrl?: string;
  };
  
  status: DonorStatus;
  isAvailable: boolean;
  verificationDate?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonor>({
  donorId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    index: true,
    validate: {
      validator: function(v: string) {
        return /^\+\d{10,15}$/.test(v);
      },
      message: 'Phone number must be in E.164 format'
    }
  },
  countryCode: { type: String, required: true },
  
  name: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, min: 18, max: 65 }, // 18-65 age range
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  bloodType: { 
    type: String, 
    required: true, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  genotype: { 
    type: String, 
    required: true, 
    enum: ['AA', 'AS', 'SS', 'AC'] 
  },
  hivStatus: { 
    type: String, 
    required: true, 
    enum: ['negative', 'positive', 'unknown'],
    default: 'unknown'
  },
  hepatitisBStatus: { 
    type: String, 
    required: true, 
    enum: ['negative', 'positive', 'immune', 'unknown'],
    default: 'unknown'
  },
  hepatitisCStatus: { 
    type: String, 
    required: true, 
    enum: ['negative', 'positive', 'immune', 'unknown'],
    default: 'unknown'
  },
  lastMedicalCheck: { type: Date, required: true },
  hasChronicIllness: { type: Boolean, default: false },
  chronicIllnessDetails: String,
  
  lastDonationDate: { type: Date },
  totalDonations: { type: Number, default: 0 },
  isRegularDonor: { type: Boolean, default: false },
  eligibilityStatus: { 
    type: String, 
    enum: ['eligible', 'ineligible', 'temporary_ineligible'],
    default: 'eligible'
  },
  cooldownUntil: { type: Date }, // our 56-day cooldown period after donation
  ineligibilityReason: String,
  
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'Nigeria' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  bankAccount: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  
  governmentId: {
    type: { 
      type: String, 
      required: true, 
      enum: ['drivers_license', 'national_id', 'passport', 'voters_card'] 
    },
    number: { type: String, required: true },
    imageUrl: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  
  medicalDocuments: {
    hivTestUrl: String,
    hepatitisBTestUrl: String,
    hepatitisCTestUrl: String,
    genotypeTestUrl: String,
    lastMedicalCheckUrl: String
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  isAvailable: { type: Boolean, default: true },
  verificationDate: { type: Date },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

DonorSchema.index({ bloodType: 1, status: 1, isAvailable: 1, eligibilityStatus: 1 });
DonorSchema.index({ 'location.city': 1, 'location.state': 1 });
DonorSchema.index({ phoneNumber: 1 }, { unique: true });
DonorSchema.index({ eligibilityStatus: 1 });


//pre-save middleware to ensure donorId is set temporarily
DonorSchema.pre('save', function(next) {
  if (!this.donorId) {
    this.donorId = `TEMP-DONOR_ID-${Date.now()}`;
  }
  next();
});

export default model<IDonor>('Donor', DonorSchema);