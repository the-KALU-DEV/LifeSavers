import { UserService } from "../../services/server/user.service";
import { VerificationService } from "../../services/third-party/dojah.verification.service";
import { Donor } from "../../models/Donor";
import { Hospital } from "../../models/Hospital";
import { sendWhatsappMessage } from "../../services/server/bot.service";
import { VerificationStep, BotFlow, UserRole } from "../../models/Enums";
import { DonorVerificationContext, HospitalVerificationContext, VerificationContext, VerificationStepResult } from "../../types/verification.types";
import { FACE_COMPARE_CONSTANTS, MAX_ATTEMPTS } from "../constants";

export class VerificationHandler {

    static async processVerification(
    currentStep: string, 
    from: string, 
    textMessage: string, 
    mediaUrl: string | null = null,
    userRole?: UserRole
  ): Promise<void> {
    
    const user = await UserService.getUserByPhone(from);
    const verificationContext = user?.contextData?.verification || {};
    // const attempts = verificationContext.attempts || 0;

    if (userRole === UserRole.HOSPITAL) {
      await this.processHospitalVerification(
        currentStep, 
        from, 
        textMessage, 
        verificationContext as HospitalVerificationContext
      );
    } else {
      await this.processDonorVerification(
        currentStep, 
        from, 
        textMessage, 
        mediaUrl, 
        verificationContext as DonorVerificationContext
      );
    }
  }

  private static async processHospitalVerification(
    currentStep: string,
    from: string,
    textMessage: string,
    verificationContext: VerificationContext
  ): Promise<void> {


    switch (currentStep) {
      case VerificationStep.START:
        await this.startHospitalVerification(from);
        break;

      case VerificationStep.ASK_CAC:
        await this.handleCACVerification(from, textMessage, verificationContext);
        break;

      case VerificationStep.COMPLETE:
        await sendWhatsappMessage(from, "✅ Hospital verification complete! You can now access the dashboard.");
        break;

      default:
        await this.restartHospitalVerification(from);
    }
  }

  private static async startHospitalVerification(from: string): Promise<void> {
    await UserService.updateUserState(from, {
      currentStep: VerificationStep.ASK_CAC
    });

    await sendWhatsappMessage(from,
      "🏥 Hospital Verification\n\n" +
      "Please provide your RC Number and Hospital Name:\n" +
      "Format: RC1234567, Hospital Name Ltd"
    );
  }

  private static async handleCACVerification(
    from: string,
    textMessage: string,
    verificationContext: VerificationContext
  ): Promise<void> {
    // parse input like so: "RC1234567, Company Name Ltd"
    const [rcNumber, ...companyNameParts] = textMessage.split(',').map(s => s.trim());
    const companyName = companyNameParts.join(' ');

    if (!rcNumber || !companyName) {
      await sendWhatsappMessage(from,
        "❌ Please provide both RC Number and Hospital Name.\n\n" +
        "Format: RC1234567, Hospital Name Ltd"
      );
      return;
    }

    const cacResult = await VerificationService.verifyCAC(rcNumber, companyName);

    if (!cacResult.success || !cacResult.verified) {
      await this.incrementAttempts(from, verificationContext);
      await sendWhatsappMessage(from,
        `❌ CAC verification failed: ${cacResult.error || cacResult.message}\n\n` +
        "Please check details and try again:"
      );
      return;
    }

    await Hospital.updateOne(
      { phoneNumber: from },
      { 
        verified: true,
        verificationData: {
          rcNumber,
          companyName,
          cacData: cacResult.data,
          verifiedAt: new Date()
        }
      }
    );

    await UserService.updateUserVerificationContext(from, {
      rcNumber,
      companyName,
      cacData: cacResult.data,
      attempts: 0
    });

    await UserService.updateUserState(from, {
      currentFlow: BotFlow.REQUEST,
      currentStep: VerificationStep.COMPLETE
    });

    const company = cacResult.data?.[0];
    await sendWhatsappMessage(from,
      `✅ Hospital Verified Successfully! 🏢\n\n` +
      `Hospital: ${company?.approvedName}\n` +
      `RC Number: ${company?.rcNumber}\n` +
      `Status: ${company?.companyStatus}\n\n` +
      `You can now access the hospital dashboard.`
    );
  }

  private static async processDonorVerification(
    currentStep: string,
    from: string,
    textMessage: string,
    mediaUrl: string | null,
    verificationContext: DonorVerificationContext
  ): Promise<void> {
    
    switch (currentStep) {
      case VerificationStep.START:
        await this.startDonorVerification(from);
        break;

      case VerificationStep.ASK_NIN:
        await this.handleNINVerification(from, textMessage, verificationContext);
        break;

      case VerificationStep.ASK_SELFIE:
        await this.handleSelfieStep(from, mediaUrl, verificationContext);
        break;

      case VerificationStep.ASK_ID:
        await this.handleIDStep(from, mediaUrl, verificationContext);
        break;

      case VerificationStep.COMPLETE:
        await sendWhatsappMessage(from, 
            "🎉 Verification complete! You're now an official LifeSaver donor ❤️\n\n`. We'll notify you when your blood type is needed.");
        break;

      default:
        await this.restartDonorVerification(from);
    }
  }

  private static async startDonorVerification(from: string): Promise<void> {
    await UserService.updateUserState(from, {
      currentStep: VerificationStep.ASK_NIN
    });

    await sendWhatsappMessage(from,
      "🩸 Donor Verification\n\n" +
      "Let's verify your identity.\n\n" +
      "Please enter your 11-digit NIN:"
    );
  }

  private static async handleNINVerification(
    from: string,
    textMessage: string,
    verificationContext: VerificationContext
  ): Promise<void> {
    const cleanNIN = textMessage.trim().replace(/\s+/g, '');

    if (!/^\d{11}$/.test(cleanNIN)) {
      await sendWhatsappMessage(from, "❌ Invalid NIN format. Please enter exactly 11 digits.");
      return;
    }

    const ninResult = await VerificationService.verifyNIN(cleanNIN);

    if (!ninResult.success) {
      await this.incrementAttempts(from, verificationContext);
      await sendWhatsappMessage(from, `❌ ${ninResult.message}\n\nPlease try again:`);
      return;
    }

    await UserService.updateUserVerificationContext(from, {
      nin: cleanNIN,
      ninResult: ninResult.data,
      attempts: 0
    });

    await UserService.updateUserState(from, {
      currentStep: VerificationStep.ASK_SELFIE
    });

    await sendWhatsappMessage(from, 
      "✅ NIN verified! 📸\n\nNow, please send a clear selfie photo of yourself."
    );
  }

  private static async handleSelfieStep(
    from: string,
    mediaUrl: string | null,
    verificationContext: VerificationContext
  ): Promise<void> {
    if (!mediaUrl) {
      await sendWhatsappMessage(from, "Please send a selfie photo (not text).");
      return;
    }

    try {
      const selfieUrl = await VerificationService.uploadMediaToGCP(mediaUrl, from, 'selfie');

      await UserService.updateUserVerificationContext(from, { 
        selfieUrl,
        attempts: 0
      });

      await UserService.updateUserState(from, {
        currentStep: VerificationStep.ASK_ID
      });

      await sendWhatsappMessage(from,
        "✅ Selfie received! 📄\n\nNow send a clear photo of your government ID card."
      );
    } catch (error: any) {
      await this.incrementAttempts(from, verificationContext);
      await sendWhatsappMessage(from, 
        `❌ ${error.message || "Failed to process selfie. Please try again."}`
      );
    }
  }

  private static async handleIDStep(
    from: string,
    mediaUrl: string | null,
    verificationContext: DonorVerificationContext
  ): Promise<void> {
    if (!mediaUrl) {
      await sendWhatsappMessage(from, "Please send a photo of your ID card.");
      return;
    }

    try {
      const { selfieUrl } = verificationContext;
      if (!selfieUrl) {
        await UserService.updateUserState(from, { 
          currentStep: VerificationStep.ASK_SELFIE 
        });
        await sendWhatsappMessage(from, 
          "⚠️ Please send your selfie first before uploading ID photo."
        );
        return;
      }

      const idUrl = await VerificationService.uploadMediaToGCP(mediaUrl, from, 'id');
      const faceCompare = await VerificationService.compareFaces(selfieUrl, idUrl);
      
      await UserService.updateUserVerificationContext(from, { 
        idUrl, 
        faceCompareResult: faceCompare 
      });

      const verified = faceCompare.success && 
                     faceCompare.match && 
                     faceCompare.confidence! >= FACE_COMPARE_CONSTANTS.MIN_CONFIDENCE;

      if (verified) {
        await this.completeDonorVerification(from, verificationContext, faceCompare);
      } else {
        await this.handleDonorVerificationFailure(from, verificationContext, faceCompare);
      }
    } catch (error: any) {
      await this.incrementAttempts(from, verificationContext);
      await sendWhatsappMessage(from, 
        `❌ ${error.message || "Failed to process ID. Please try again."}`
      );
    }
  }

  private static async completeDonorVerification(
    from: string,
    verificationContext: DonorVerificationContext,
    faceCompare: any
  ): Promise<void> {
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

    await sendWhatsappMessage(from,
      `🎉 Verification complete! You're now an official LifeSaver donor. ❤️\n\n` +
      `Confidence: ${faceCompare.confidence?.toFixed(1)}%`
    );
  }

  private static async handleDonorVerificationFailure(
    from: string,
    verificationContext: VerificationContext,
    faceCompare: any
  ): Promise<void> {
    const attempts = (verificationContext.attempts || 0) + 1;
    await this.incrementAttempts(from, verificationContext);

    if (attempts >= MAX_ATTEMPTS) {
      await this.handleMaxAttemptsReached(from);
      return;
    }

    let message = "❌ Verification failed. ";
    
    if (!faceCompare.success) {
      message += "Could not process photos. ";
    } else if (!faceCompare.match) {
      message += "Selfie and ID don't match. ";
    } else if (faceCompare.confidence < FACE_COMPARE_CONSTANTS.MIN_CONFIDENCE) {
      message += `Low confidence (${faceCompare.confidence?.toFixed(1)}%). `;
    }
    
    message += `\nAttempt ${attempts} of ${MAX_ATTEMPTS}. Let's try that again.\n\nPlease send a new selfie:`;

    await UserService.updateUserState(from, {
      currentStep: VerificationStep.ASK_SELFIE
    });

    await sendWhatsappMessage(from, message);
  }

  private static async restartHospitalVerification(from: string): Promise<void> {
    await UserService.updateUserState(from, { 
      currentStep: VerificationStep.START 
    });
    await this.startHospitalVerification(from);
  }

  private static async restartDonorVerification(from: string): Promise<void> {
    await UserService.updateUserState(from, { 
      currentStep: VerificationStep.START 
    });
    await this.startDonorVerification(from);
  }

  private static async handleMaxAttemptsReached(from: string): Promise<void> {
    await UserService.updateUserState(from, {
      currentStep: VerificationStep.VERIFICATION_FAILED
    });

    await sendWhatsappMessage(from,
      "❌ Maximum verification attempts reached.\n\n" +
      "Please contact our support team for assistance:\n" +
      "📞 Support: +1234567890\n" +
      "✉️ Email: support@lifesavers.org"
    );
  }

  private static async incrementAttempts(from: string, verificationContext: VerificationContext): Promise<void> {
    const currentAttempts = verificationContext.attempts || 0;
    await UserService.updateUserVerificationContext(from, {
      attempts: currentAttempts + 1,
      lastAttemptAt: new Date()
    });
  }
}