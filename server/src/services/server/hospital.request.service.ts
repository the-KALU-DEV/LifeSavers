import { Request } from "../../models/Request";
import { Hospital } from "../../models/Hospital";
import { sendWhatsappMessage } from "./bot.service";
import { UserService } from "./user.service";
import { RequestContext } from "../../types/request.types";
import { BloodGroup, Genotype, UrgencyLevel, RequestStatus, BotFlow, RequestStep } from "../../models/Enums";

export class HospitalRequestService {
  
  static async startRequestCreation(from: string): Promise<void> {
    await Promise.all([
      UserService.updateUserState(from, {
        currentFlow: BotFlow.REQUEST,
        currentStep: RequestStep.START
      }),
      sendWhatsappMessage(
        from,
        "🏥 Create Blood Request\n\nLet's create a new blood request for your hospital."
      )
    ]);
  }

  static async processRequestCreation(
    currentStep: string,
    from: string,
    message: string
  ): Promise<void> {
    const context = await this.getRequestContext(from);

    switch (currentStep) {
      case RequestStep.START:
        await this.handleStart(from, context);
        break;
      
      case RequestStep.BLOOD_TYPE:
        await this.handleBloodType(from, message, context);
        break;
      
      case RequestStep.GENOTYPE:
        await this.handleGenotype(from, message, context);
        break;
      
      case RequestStep.UNITS_NEEDED:
        await this.handleUnitsNeeded(from, message, context);
        break;
      
      case RequestStep.URGENCY:
        await this.handleUrgency(from, message, context);
        break;
      
      case RequestStep.DEADLINE:
        await this.handleDeadline(from, message, context);
        break;
      
      case RequestStep.CONFIRM:
        await this.handleConfirmation(from, message, context);
        break;
      
      default:
        await this.handleInvalidStep(from);
    }
  }

  private static async handleStart(from: string, context: RequestContext): Promise<void> {
    await UserService.updateUserState(from, {
      currentStep: RequestStep.BLOOD_TYPE
    });

    const bloodTypes = Object.values(BloodGroup).join(', ');
    await sendWhatsappMessage(
      from,
      "What blood type is needed?\n\n" +
      `Available types: ${bloodTypes}\n\n` +
      "Please enter the blood type (e.g. A+, O-, etc.):"
    );
  }

  private static async handleBloodType(from: string, message: string, context: RequestContext): Promise<void> {
    const bloodType = message.trim().toUpperCase() as BloodGroup;
    
    if (!Object.values(BloodGroup).includes(bloodType)) {
      await sendWhatsappMessage(from, "❌ Invalid blood type. Please enter a valid blood type:");
      return;
    }

    context.bloodType = bloodType;
    await this.updateRequestContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: RequestStep.GENOTYPE
    });

    const genotypes = Object.values(Genotype).join(', ');
    await sendWhatsappMessage(
      from,
      "What genotype is required?\n\n" +
      `Available genotypes: ${genotypes}\n\n` +
      "Please enter the genotype (e.g. AA, AS, etc.):"
    );
  }

  private static async handleGenotype(from: string, message: string, context: RequestContext): Promise<void> {
    const genotype = message.trim().toUpperCase() as Genotype;
    
    if (!Object.values(Genotype).includes(genotype)) {
      await sendWhatsappMessage(from, "❌ Invalid genotype. Please enter a valid genotype:");
      return;
    }

    context.genotype = genotype;
    await this.updateRequestContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: RequestStep.UNITS_NEEDED
    });

    await sendWhatsappMessage(
      from,
      "How many units (pints) of blood are needed?\n\n" +
      "Enter a number between 1-15:\n" +
      "(1 unit = 1 pint)"
    );
  }

  private static async handleUnitsNeeded(from: string, message: string, context: RequestContext): Promise<void> {
    const units = parseInt(message.trim());
    
    if (isNaN(units) || units < 1 || units > 15) {
      await sendWhatsappMessage(from, "❌ Please enter a valid number between 1-15:");
      return;
    }

    context.unitsNeeded = units;
    await this.updateRequestContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: RequestStep.URGENCY
    });

    await sendWhatsappMessage(
      from,
      "What is the urgency level?\n\n" +
      "1. Low (1 month)\n" +
      "2. Medium (3 weeks)\n" + 
      "3. High (2 weeks)\n" +
      "4. Emergency (1 week)\n\n" +
      "Please enter 1, 2, 3, or 4:"
    );
  }

  private static async handleUrgency(from: string, message: string, context: RequestContext): Promise<void> {
    const urgencyMap = {
      '1': UrgencyLevel.LOW,
      '2': UrgencyLevel.MEDIUM, 
      '3': UrgencyLevel.HIGH,
      '4': UrgencyLevel.EMERGENCY
    };

    const urgency = urgencyMap[message as keyof typeof urgencyMap];
    
    if (!urgency) {
      await sendWhatsappMessage(from, "❌ Please enter 1, 2, 3, or 4:");
      return;
    }

    context.urgency = urgency;
    await this.updateRequestContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: RequestStep.DEADLINE
    });

    await sendWhatsappMessage(
      from,
      "When is the deadline for this request?\n\n" +
      "Please enter the date in format: YYYY-MM-DD\n" +
      "Example: 2024-02-15"
    );
  }

  private static async handleDeadline(from: string, message: string, context: RequestContext): Promise<void> {
    const deadline = new Date(message.trim());
    
    if (isNaN(deadline.getTime()) || deadline <= new Date()) {
      await sendWhatsappMessage(from, "❌ Please enter a valid future date (YYYY-MM-DD):");
      return;
    }

    context.deadline = message.trim();
    await this.updateRequestContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: RequestStep.CONFIRM
    });

    await sendWhatsappMessage(
      from,
      `📋 Please confirm your blood request:\n\n` +
      `Blood Type: ${context.bloodType}\n` +
      `Genotype: ${context.genotype}\n` +
      `Units Needed: ${context.unitsNeeded} pints\n` +
      `Urgency: ${context.urgency}\n` +
      `Deadline: ${context.deadline}\n\n` +
      `Type 'CONFIRM' to create this request or 'CANCEL' to start over:`
    );
  }

  private static async handleConfirmation(from: string, message: string, context: RequestContext): Promise<void> {
    if (message.toUpperCase() === 'CANCEL') {
      await this.cancelRequestCreation(from);
      return;
    }

    if (message.toUpperCase() !== 'CONFIRM') {
      await sendWhatsappMessage(from, "❌ Please type 'CONFIRM' to create or 'CANCEL' to start over:");
      return;
    }

    await this.createFinalRequest(from, context);
  }

  private static async createFinalRequest(from: string, context: RequestContext): Promise<void> {
    try {
      const hospital = await Hospital.findOne({ phoneNumber: from });
      
      if (!hospital) {
        await sendWhatsappMessage(from, "❌ Hospital not found. Please complete registration first.");
        return;
      }

      const bloodRequest = await Request.create({
        hospital: hospital._id,
        bloodType: context.bloodType!,
        genotype: context.genotype!,
        unitsNeeded: context.unitsNeeded!,
        urgency: context.urgency!,
        deadline: new Date(context.deadline!),
        status: RequestStatus.ACTIVE
      });

      await this.clearRequestContext(from);

      await UserService.updateUserState(from, {
        currentFlow: BotFlow.REQUEST,
        currentStep: RequestStep.COMPLETE
      });

      await sendWhatsappMessage(
        from,
        `✅ Blood Request Created Successfully! 🏥\n\n` +
        `Request ID: ${bloodRequest.requestId}\n` +
        `Blood Type: ${bloodRequest.bloodType}\n` +
        `Genotype: ${bloodRequest.genotype}\n` +
        `Units Needed: ${bloodRequest.unitsNeeded}\n` +
        `Urgency: ${bloodRequest.urgency}\n` +
        `Deadline: ${bloodRequest.deadline.toDateString()}\n\n` +
        `Donors with matching blood type will now see your request.`
      );

    } catch (error: any) {
      await sendWhatsappMessage(
        from,
        "❌ Failed to create request. Please try again or contact support."
      );
    }
  }

  private static async cancelRequestCreation(from: string): Promise<void> {
    await this.clearRequestContext(from);
    await UserService.updateUserState(from, {
      currentFlow: BotFlow.REQUEST,
      currentStep: RequestStep.START
    });

    await sendWhatsappMessage(from, "❌ Request creation cancelled. Type 'request' to start over.");
  }

  private static async handleInvalidStep(from: string): Promise<void> {
    await sendWhatsappMessage(
      from,
      "I didn't understand that. Please type 'request' to create a new blood request."
    );
  }

  private static async updateRequestContext(from: string, context: RequestContext): Promise<void> {
    await Hospital.findOneAndUpdate(
      { phoneNumber: from },
      { 
        contextData: { request: context },
        lastInteractionAt: new Date()
      }
    );
  }

  private static async getRequestContext(from: string): Promise<RequestContext> {
    const hospital = await Hospital.findOne({ phoneNumber: from });
    return hospital?.contextData?.request || {};
  }

  private static async clearRequestContext(from: string): Promise<void> {
    await Hospital.findOneAndUpdate(
      { phoneNumber: from },
      { 
        contextData: { request: {} },
        lastInteractionAt: new Date()
      }
    );
  }
}