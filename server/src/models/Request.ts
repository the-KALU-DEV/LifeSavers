import mongoose, { Schema, Document } from "mongoose";
import { BloodGroup, Genotype, RequestStatus, UrgencyLevel } from "./Enums";

export interface IRequest extends Document {
  requestId: string;
  hospital: mongoose.Types.ObjectId;
  bloodType: BloodGroup;
  genotype: Genotype;
  unitsNeeded: number;
  unitsPledged: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  hospital: { 
    type: Schema.Types.ObjectId, 
    ref: "Hospital", 
    required: true 
  },
  bloodType: { 
    type: String, 
    enum: Object.values(BloodGroup), 
    required: true 
  },
  genotype: { 
    type: String, 
    enum: Object.values(Genotype), 
    required: true 
  },
  unitsNeeded: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 15 
  },
  unitsPledged: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  urgency: { 
    type: String, 
    enum: Object.values(UrgencyLevel), 
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(RequestStatus), 
    default: RequestStatus.CREATED 
  },
  deadline: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

// auto-expire requests when deadline passes
RequestSchema.index({ deadline: 1 }, { expireAfterSeconds: 0 });

// generate unique request ID before saving
RequestSchema.pre("save", function (next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.requestId = `REQ-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export const Request = mongoose.model<IRequest>("Request", RequestSchema);