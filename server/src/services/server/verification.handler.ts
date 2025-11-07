import { UserService } from "./user.service";
import { VerificationService } from "../third-party/kyc.verification.service";
import { Donor } from "../../models/Donor";
import { sendWhatsappMessage } from "./registration.service";
import { VerificationStep, BotFlow } from "../../models/Enums";

export class VerificationHandler {
    private static readonly MAX_ATTEMPTS = 3;
    private static readonly MIN_CONFIDENCE = 98;

    static async processVerification(currentStep: string, from: string, textMessage: string, mediaUrl: string | null = null) {
        console.log("Processing Verification", { currentStep, from, textMessage, mediaUrl });

        const user = await UserService.getUserByPhone(from);
        const verificationContext = user?.contextData?.verification || {};
        const attempts = verificationContext.attempts || 0;
        
        const isMedia = mediaUrl !== null && mediaUrl !== undefined;

        if (attempts >= this.MAX_ATTEMPTS) {
            return await this.handleMaxAttemptsReached(from);
        }

        switch (currentStep) {
            case VerificationStep.ASK_NIN:
                console.log("In NIN Verification Step");
                return await this.handleNINVerification(from, textMessage, isMedia, verificationContext);

            case VerificationStep.ASK_SELFIE:
                console.log("In Selfie Verification Step");
                if (!isMedia) {
                    return await sendWhatsappMessage(from, "Please send a selfie photo (not text).");
                }
                return await this.handleSelfieUpload(from, mediaUrl, verificationContext);

            case VerificationStep.ASK_ID:
                console.log("In ID Verification Step");
                if (!isMedia) {
                    return await sendWhatsappMessage(from, "Please send a photo of your ID card.");
                }
                return await this.handleIDVerification(from, mediaUrl, verificationContext);

            case VerificationStep.COMPLETE:
                console.log("User Already Verified");
                return await sendWhatsappMessage(from, "✅ You're already verified. Thank you for saving lives!");

            case VerificationStep.VERIFICATION_FAILED:
                console.log("User has reached max verification attempts");
                return await sendWhatsappMessage(from, "❌ Maximum verification attempts reached. Please contact support.");

            default:
                console.log("Invalid verification step, restarting");
                await UserService.updateUserState(from, { 
                    currentStep: VerificationStep.ASK_NIN 
                });
                return await sendWhatsappMessage(from, "Let's begin your verification.");
        }
    }

    private static async handleNINVerification(from: string, textMessage: string, isMedia: boolean, verificationContext: any) {
        if (isMedia) {
            return await sendWhatsappMessage(from, "Please enter your 11-digit NIN (text only).");
        }

        const cleanNIN = textMessage.trim().replace(/\s+/g, '');

        if (!/^\d{11}$/.test(cleanNIN)) {
            return await sendWhatsappMessage(from, "❌ Invalid NIN format. Please enter exactly 11 digits.");
        }

        const ninResult = await VerificationService.verifyNIN(cleanNIN);

        if (!ninResult.success) {
            await this.incrementAttempts(from, verificationContext);
            return await sendWhatsappMessage(from, `❌ ${ninResult.message}\n\nPlease try again:`);
        }

        await UserService.updateUserVerificationContext(from, {
            nin: cleanNIN,
            ninResult: ninResult.data,
            attempts: 0
        });

        await UserService.updateUserState(from, {
            currentStep: VerificationStep.ASK_SELFIE
        });

        return await sendWhatsappMessage(from, 
            "✅ NIN verified! 📸\n\nNow, please send a clear selfie photo of yourself."
        );
    }

    private static async handleSelfieUpload(from: string, mediaUrl: string, verificationContext: any) {
        try {
            const selfieUrl = await VerificationService.uploadMediaToS3(mediaUrl, from, 'selfie');

            await UserService.updateUserVerificationContext(from, { 
                selfieUrl,
                attempts: 0
            });

            await UserService.updateUserState(from, {
                currentStep: VerificationStep.ASK_ID
            });

            return await sendWhatsappMessage(from,
                "✅ Selfie received! 📄\n\nNow send a clear photo of your government ID card."
            );
        } catch (error: any) {
            await this.incrementAttempts(from, verificationContext);
            const errorMsg = error.message || "Failed to process selfie. Please try again with a clear, well-lit photo.";
            return await sendWhatsappMessage(from, `❌ ${errorMsg}`);
        }
    }

    private static async handleIDVerification(from: string, mediaUrl: string, verificationContext: any) {
        try {
            const { selfieUrl } = verificationContext;
            if (!selfieUrl) {
                await UserService.updateUserState(from, { 
                    currentStep: VerificationStep.ASK_SELFIE 
                });
                return await sendWhatsappMessage(from, 
                    "⚠️ Please send your selfie first before uploading ID photo."
                );
            }

            const idUrl = await VerificationService.uploadMediaToS3(mediaUrl, from, 'id');
            const faceCompare = await VerificationService.compareFaces(selfieUrl, idUrl);
            
            await UserService.updateUserVerificationContext(from, { 
                idUrl, 
                faceCompareResult: faceCompare 
            });

            const verified = faceCompare.success && 
                           faceCompare.match && 
                           faceCompare.confidence! >= this.MIN_CONFIDENCE;

            if (verified) {
                return await this.handleSuccessfulVerification(from, verificationContext, faceCompare);
            } else {
                return await this.handleFailedVerification(from, verificationContext, faceCompare);
            }
        } catch (error: any) {
            await this.incrementAttempts(from, verificationContext);
            const errorMsg = error.message || "Failed to process ID. Please try again with a clearer photo.";
            return await sendWhatsappMessage(from, `❌ ${errorMsg}`);
        }
    }

    private static async handleSuccessfulVerification(from: string, verificationContext: any, faceCompare: any) {
        await Donor.updateOne(
            { phoneNumber: from },
            {
                verified: true,
                verificationData: {
                    nin: verificationContext.nin,
                    ninResult: verificationContext.ninResult,
                    selfieUrl: verificationContext.selfieUrl,
                    idUrl: verificationContext.idUrl,
                    faceCompareResult: faceCompare,
                    verifiedAt: new Date()
                },
            }
        );

        await UserService.updateUserState(from, {
            currentFlow: BotFlow.DONATION,
            currentStep: VerificationStep.COMPLETE
        });

        return await sendWhatsappMessage(from,
            `🎉 Verification complete! You're now an official LifeSaver donor. ❤️\n\n` +
            `Confidence: ${faceCompare.confidence?.toFixed(1)}%`
        );
    }

    private static async handleFailedVerification(from: string, verificationContext: any, faceCompare: any) {
        const attempts = (verificationContext.attempts || 0) + 1;
        await this.incrementAttempts(from, verificationContext);

        if (attempts >= this.MAX_ATTEMPTS) {
            return await this.handleMaxAttemptsReached(from);
        }

        let message = "❌ Verification failed. ";
        
        if (!faceCompare.success) {
            message += "Could not process photos. ";
        } else if (!faceCompare.match) {
            message += "Selfie and ID don't match. ";
        } else if (faceCompare.confidence < this.MIN_CONFIDENCE) {
            message += `Low confidence (${faceCompare.confidence?.toFixed(1)}%). `;
        }
        
        message += `\nAttempt ${attempts} of ${this.MAX_ATTEMPTS}. Let's try again.\n\nPlease send a new selfie:`;

        await UserService.updateUserState(from, {
            currentStep: VerificationStep.ASK_SELFIE
        });

        return await sendWhatsappMessage(from, message);
    }

    private static async handleMaxAttemptsReached(from: string) {
        await UserService.updateUserState(from, {
            currentStep: VerificationStep.VERIFICATION_FAILED
        });

        return await sendWhatsappMessage(from,
            "❌ Maximum verification attempts reached.\n\n" +
            "Please contact our support team for assistance:\n" +
            "📞 Support: +1234567890\n" +
            "✉️ Email: support@lifesavers.org"
        );
    }

    private static async incrementAttempts(from: string, verificationContext: any) {
        const currentAttempts = verificationContext.attempts || 0;
        await UserService.updateUserVerificationContext(from, {
            attempts: currentAttempts + 1,
            lastAttemptAt: new Date()
        });
    }
}