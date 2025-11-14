import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { VerificationStatus, UserRole } from "./Enums";

export interface IHospital extends IUser {
  hospitalName: string;
  licenseNumber: string;
  contact: string;
  address: string;
  adminName: string;
  adminPhone: string;
  pictures: string[];
  tempCredits: number;
  verificationStatus: VerificationStatus;
  referenceNumber: string;
}

const HospitalSchema = new Schema<IHospital>(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminPhone: {
      type: String,
      required: true,
      trim: true,
    },
    pictures: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.HOSPITAL,
    },
    tempCredits: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    referenceNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Generate reference number before saving
HospitalSchema.pre("save", function (this: IHospital, next: () => void) {
  if (!this.referenceNumber) {
    this.referenceNumber = `HOS-${Math.floor(Math.random() * 9999)}-LG`;
  }
  next();
});

export const Hospital = mongoose.model<IHospital>("Hospital", HospitalSchema);
