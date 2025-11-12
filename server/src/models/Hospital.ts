import { Document, Schema, model } from "mongoose";

export interface IHospital extends Document {
  hospitalName: string;
  licenseNumber: string;
  contact: string;
  address: string;
  adminName: string;
  adminPhone: string;
  pictures: string[];
  phoneNumber: string;
  role: string;
  tempCredits: number;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  referenceNumber: string;
  createdAt: Date;
  updatedAt: Date;
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "HOSPITAL",
    },
    tempCredits: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    referenceNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate reference number before saving
HospitalSchema.pre("save", function (this: IHospital, next: () => void) {
  if (!this.referenceNumber) {
    this.referenceNumber = `HOS-${Math.floor(Math.random() * 9999)}-LG`;
  }
  next();
});

export const Hospital = model<IHospital>("Hospital", HospitalSchema);
