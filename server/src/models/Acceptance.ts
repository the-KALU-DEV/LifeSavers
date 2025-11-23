import mongoose, { Schema, Document } from "mongoose";
import { AcceptanceStatus } from "./Enums";

export interface IAcceptance extends Document {
  request: mongoose.Types.ObjectId;
  donor: mongoose.Types.ObjectId;
  unitsPledged: number; // max 1-2 units per request
  status: AcceptanceStatus;
  pledgedAt: Date;
  completedAt?: Date;
}

const AcceptanceSchema = new Schema<IAcceptance>({
  request: { 
    type: Schema.Types.ObjectId, 
    ref: "Request", 
    required: true 
  },
  donor: { 
    type: Schema.Types.ObjectId, 
    ref: "Donor", 
    required: true 
  },
  unitsPledged: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 2 
  },
  status: { 
    type: String, 
    enum: Object.values(AcceptanceStatus), 
    default: AcceptanceStatus.PENDING 
  },
  pledgedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  }
}, { timestamps: true });

// to prevent duplicate acceptances
AcceptanceSchema.index({ request: 1, donor: 1 }, { unique: true });

export const Acceptance = mongoose.model<IAcceptance>("Acceptance", AcceptanceSchema);