import { BloodGroup, Genotype, UrgencyLevel } from "../models/Enums";

export interface RequestContext {
  bloodType?: BloodGroup;
  genotype?: Genotype;
  unitsNeeded?: number;
  urgency?: UrgencyLevel;
  deadline?: string;
}