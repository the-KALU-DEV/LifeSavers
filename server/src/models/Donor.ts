import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { BloodGroup, Genotype } from "./Enums";

export interface IDonor extends IUser {
    bloodGroup?: BloodGroup;
    genotype?: Genotype;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    verified: boolean;
}

const DonorSchema = new Schema<IDonor>(
    {
        bloodGroup: { type: String, enum: Object.values(BloodGroup) },
        genotype: { type: String, enum: Object.values(Genotype) },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                index: "2dsphere",
            },
        },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Donor = mongoose.model<IDonor>("Donor", DonorSchema);
