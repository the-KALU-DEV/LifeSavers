import mongoose, { Schema, Document, trusted } from "mongoose";
import { UserRole, Gender, BotFlow } from "./Enums";

export interface IUser extends Document {
  phoneNumber: string;
  username?: string;
  fullName?: string;
  role: UserRole;
  gender?: Gender;
  currentFlow: BotFlow;
  currentStep: string;
  contextData: Record<string, any>;
  lastInteractionAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: { type: String, required: true, unique: true },
    username: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.DONOR },
    gender: { type: String, enum: Object.values(Gender) },
    currentFlow: { type: String, enum: Object.values(BotFlow), required: true },
    currentStep: { type: String, required: true },
    contextData: { type: Object, default: {} },
    lastInteractionAt: { type: Date, default: Date.now },
    isActive: {type: Boolean, default: true}
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
