import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./User";
import { BloodGroup, Genotype } from "./Enums";

export interface IDonor {
    bloodGroup?: BloodGroup;
    userId: Schema.Types.ObjectId;
    genotype?: Genotype;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    contextData: {
        verification: {
            nin?: string;
            ninResult?: any;
            selfieUrl?: string;
            idUrl?: string;
            faceCompareResult?: any;
        };
    },
    verified: boolean;
}

const DonorSchema = new Schema<IDonor>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
        contextData: {
            verification: {
                nin: { type: String },
                ninResult: { type: Object },
                selfieUrl: { type: String },
                idUrl: { type: String },
                faceCompareResult: { type: Object }
            }
        },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Donor = mongoose.model<IDonor>("Donor", DonorSchema);
