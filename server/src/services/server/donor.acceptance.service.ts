import { Donor } from "../../models/Donor";
import { Request as RequestModel } from "../../models/Request";
import { Acceptance } from "../../models/Acceptance";
import { sendWhatsappMessage } from "./bot.service";
import { UserService } from "./user.service";
import { AcceptanceContext } from "../../types/acceptance.types";
import { AcceptanceStatus, AcceptanceStep, BotFlow, RequestStatus, } from "../../models/Enums";

export class DonorAcceptanceService {
  
  static async startAcceptanceFlow(from: string): Promise<void> {
    await Promise.all([
      UserService.updateUserState(from, {
        currentFlow: BotFlow.REQUESTACCEPTANCE,
        currentStep: AcceptanceStep.START
      }),
      sendWhatsappMessage(
        from,
        "🩸 Available Blood Requests\n\nLet's find requests matching your blood type."
      )
    ]);
    await this.showMatchingRequests(from);
  }

  static async processAcceptance(
    currentStep: string,
    from: string,
    message: string
  ): Promise<void> {
    const context = await this.getAcceptanceContext(from);

    switch (currentStep) {
      case AcceptanceStep.START:
        await this.showMatchingRequests(from);
        break;
      
      case AcceptanceStep.SELECT_REQUEST:
        await this.handleRequestSelection(from, message, context);
        break;
      
      case AcceptanceStep.PLEDGE_UNITS:
        await this.handlePledgeUnits(from, message, context);
        break;
      
      case AcceptanceStep.CONFIRM_AVAILABILITY:
        await this.handleAvailability(from, message, context);
        break;
      
      case AcceptanceStep.FINAL_CONFIRM:
        await this.handleFinalConfirmation(from, message, context);
        break;
      
      default:
        await this.handleInvalidStep(from);
    }
  }

  private static async showMatchingRequests(from: string): Promise<void> {
    try {
      const donor = await Donor.findOne({ phoneNumber: from });
      if (!donor) {
        await sendWhatsappMessage(from, "❌ Donor not found. Please complete registration first.");
        return;
      }

      const matchingRequests = await RequestModel.find({
        bloodType: donor.bloodGroup,
        status: { $in: [RequestStatus.ACTIVE, RequestStatus.PARTIALLY_FULFILLED] }
      })
      .populate("hospital", "hospitalName address contact")
      .select("bloodType genotype unitsNeeded unitsPledged urgency status deadline createdAt")
      .sort({ urgency: -1, createdAt: -1 })
      .limit(10); // to show top 10 most urgent

      if (matchingRequests.length === 0) {
        await sendWhatsappMessage(
          from,
          "No matching requests found at the moment. 🎉\n\n" +
          "This means all current blood needs for your type are met!\n" +
          "Check back later for new requests."
        );
        return;
      }

      let message = "📋 **Matching Blood Requests:**\n\n";
      matchingRequests.forEach((request: any, index) => {
        const remainingUnits = request.unitsNeeded - request.unitsPledged;
        message += `${index + 1}. ${(request.hospital as any).hospitalName}\n` +
                  `   🩸 ${request.bloodType} | 🧬 ${request.genotype}\n` +
                  `   📦 ${remainingUnits}/${request.unitsNeeded} units needed\n` +
                  `   ⚡ ${request.urgency} | 📅 ${request.deadline.toDateString()}\n\n`;
      });

      message += "Enter the number of the request you want to accept (1, 2, 3, etc.):";

      await UserService.updateUserState(from, {
        currentStep: AcceptanceStep.SELECT_REQUEST
      });

      await sendWhatsappMessage(from, message);

    } catch (error: any) {
      await sendWhatsappMessage(from, "❌ Error fetching requests. Please try again.");
    }
  }

  private static async handleRequestSelection(
    from: string, 
    message: string, 
    context: AcceptanceContext
  ): Promise<void> {
    const donor = await Donor.findOne({ phoneNumber: from });
    if (!donor) return;

    const matchingRequests = await RequestModel.find({
      bloodType: donor.bloodGroup,
      status: { $in: [RequestStatus.ACTIVE, RequestStatus.PARTIALLY_FULFILLED] }
    }).sort({ urgency: -1, createdAt: -1 }).limit(10);

    const selectedIndex = parseInt(message) - 1;
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= matchingRequests.length) {
      await sendWhatsappMessage(from, "❌ Please enter a valid number from the list:");
      return;
    }

    const selectedRequest = matchingRequests[selectedIndex];
    context.selectedRequestId = (selectedRequest as any)._id.toString();

    await this.updateAcceptanceContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: AcceptanceStep.PLEDGE_UNITS
    });

    const remainingUnits = selectedRequest.unitsNeeded - selectedRequest.unitsPledged;
    
    await sendWhatsappMessage(
      from,
      `✅ Selected: ${(selectedRequest as any).hospital.hospitalName}\n\n` +
      `How many units can you pledge?\n` +
      `• Maximum: 2 units\n` +
      `• Remaining needed: ${remainingUnits} units\n\n` +
      `Enter 1 or 2:`
    );
  }

  private static async handlePledgeUnits(
    from: string, 
    message: string, 
    context: AcceptanceContext
  ): Promise<void> {
    const unitsPledged = parseInt(message);
    
    if (unitsPledged !== 1 && unitsPledged !== 2) {
      await sendWhatsappMessage(from, "❌ Please enter 1 or 2:");
      return;
    }

    const donor = await Donor.findOne({ phoneNumber: from });
    if (!donor || donor.eligibilityStatus !== "eligible") {
      await sendWhatsappMessage(from, "❌ You are not currently eligible to donate.");
      return;
    }

    const request = await RequestModel.findById(context.selectedRequestId);
    if (!request || request.status === RequestStatus.FULFILLED) {
      await sendWhatsappMessage(from, "❌ This request is no longer available.");
      return;
    }

    const remainingUnits = request.unitsNeeded - request.unitsPledged;
    if (unitsPledged > remainingUnits) {
      await sendWhatsappMessage(from, `❌ Only ${remainingUnits} units remaining needed.`);
      return;
    }

    context.unitsPledged = unitsPledged;
    await this.updateAcceptanceContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: AcceptanceStep.CONFIRM_AVAILABILITY
    });

    await sendWhatsappMessage(
      from,
      "When are you available to donate?\n\n" +
      "1. Within 24 hours\n" +
      "2. Within 3 days\n" +
      "3. Within 1 week\n" +
      "4. Flexible - contact me\n\n" +
      "Enter 1, 2, 3, or 4:"
    );
  }

  private static async handleAvailability(
    from: string, 
    message: string, 
    context: AcceptanceContext
  ): Promise<void> {
    const availabilityMap = {
      '1': 'Within 24 hours',
      '2': 'Within 3 days', 
      '3': 'Within 1 week',
      '4': 'Flexible - contact me'
    };

    const availability = availabilityMap[message as keyof typeof availabilityMap];
    
    if (!availability) {
      await sendWhatsappMessage(from, "❌ Please enter 1, 2, 3, or 4:");
      return;
    }

    context.availability = availability;
    await this.updateAcceptanceContext(from, context);

    await UserService.updateUserState(from, {
      currentStep: AcceptanceStep.FINAL_CONFIRM
    });

    const request = await RequestModel.findById(context.selectedRequestId)
      .populate("hospital", "hospitalName address contact");

    await sendWhatsappMessage(
      from,
      `📋 **Please Confirm Your Pledge:**\n\n` +
      `🏥 Hospital: ${(request?.hospital as any).hospitalName}\n` +
      `📍 Address: ${(request?.hospital as any).address}\n` +
      `📞 Contact: ${(request?.hospital as any).contact}\n` +
      `🩸 Blood Type: ${request?.bloodType}\n` +
      `🧬 Genotype: ${request?.genotype}\n` +
      `📦 Units Pledged: ${context.unitsPledged}\n` +
      `📅 Availability: ${availability}\n\n` +
      `Type 'CONFIRM' to proceed or 'CANCEL' to start over:`
    );
  }

  private static async handleFinalConfirmation(
    from: string, 
    message: string, 
    context: AcceptanceContext
  ): Promise<void> {
    if (message.toUpperCase() === 'CANCEL') {
      await this.cancelAcceptanceFlow(from);
      return;
    }

    if (message.toUpperCase() !== 'CONFIRM') {
      await sendWhatsappMessage(from, "❌ Please type 'CONFIRM' to proceed or 'CANCEL' to start over:");
      return;
    }

    await this.createFinalAcceptance(from, context);
  }

  private static async createFinalAcceptance(from: string, context: AcceptanceContext): Promise<void> {
    try {
      const [donor, request] = await Promise.all([
        Donor.findOne({ phoneNumber: from }),
        RequestModel.findById(context.selectedRequestId).populate("hospital")
      ]);

      if (!donor || !request) {
        await sendWhatsappMessage(from, "❌ Donor or request not found.");
        return;
      }

      const acceptance = await Acceptance.create({
        request: context.selectedRequestId,
        donor: donor._id,
        unitsPledged: context.unitsPledged!,
        status: AcceptanceStatus.PENDING
      });

      // update request units and status
      const newUnitsPledged = request.unitsPledged + context.unitsPledged!;
      let newStatus = request.status;

      if (newUnitsPledged >= request.unitsNeeded) {
        newStatus = RequestStatus.FULFILLED;
      } else if (newUnitsPledged > 0) {
        newStatus = RequestStatus.PARTIALLY_FULFILLED;
      }

      await RequestModel.findByIdAndUpdate(context.selectedRequestId, {
        unitsPledged: newUnitsPledged,
        status: newStatus
      });

      await this.clearAcceptanceContext(from);

      await UserService.updateUserState(from, {
        currentFlow: BotFlow.REQUESTACCEPTANCE,
        currentStep: AcceptanceStep.COMPLETE
      });

      await sendWhatsappMessage(
        from,
        `✅ **Pledge Confirmed! Thank You!** 🎉\n\n` +
        `You've pledged ${context.unitsPledged} unit(s) to ${(request.hospital as any).hospitalName}.\n\n` +
        `🏥 **Hospital Details:**\n` +
        `📍 ${(request.hospital as any).address}\n` +
        `📞 ${(request.hospital as any).contact}\n\n` +
        `📅 **Your Availability:** ${context.availability}\n\n` +
        `💡 **Next Steps:**\n` +
        `• Visit the hospital within your stated availability\n` +
        `• Bring valid ID for verification\n` +
        `• Stay hydrated before donation\n\n` +
        `Thank you for saving lives! ❤️`
      );

    } catch (error: any) {
      await sendWhatsappMessage(
        from,
        "❌ Failed to create acceptance. Please try again."
      );
    }
  }

  private static async updateAcceptanceContext(from: string, context: AcceptanceContext): Promise<void> {
    await Donor.findOneAndUpdate(
      { phoneNumber: from },
      { 
        contextData: { acceptance: context },
        lastInteractionAt: new Date()
      }
    );
  }

  private static async getAcceptanceContext(from: string): Promise<AcceptanceContext> {
    const donor = await Donor.findOne({ phoneNumber: from });
    return ((donor?.contextData as any)?.acceptance || {}) as AcceptanceContext;
  }

  private static async clearAcceptanceContext(from: string): Promise<void> {
    await Donor.findOneAndUpdate(
      { phoneNumber: from },
      { 
        contextData: { acceptance: {} },
        lastInteractionAt: new Date()
      }
    );
  }

  private static async cancelAcceptanceFlow(from: string): Promise<void> {
    await this.clearAcceptanceContext(from);
    await UserService.updateUserState(from, {
      currentFlow: BotFlow.REQUESTACCEPTANCE,
      currentStep: AcceptanceStep.START
    });
    await sendWhatsappMessage(from, "❌ Acceptance cancelled. Type 'accept' to start over.");
  }

  private static async handleInvalidStep(from: string): Promise<void> {
    await sendWhatsappMessage(
      from,
      "I didn't understand that. Please type 'accept' to start accepting requests."
    );
  }
}