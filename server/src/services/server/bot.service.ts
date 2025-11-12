import {
  BotFlow,
  RegistrationStep,
  UserRole,
  HospitalRegistrationStep,
} from "../../models/Enums";
import { processFlow } from "./donor.service";
import { HospitalRegistrationService } from "./hospitalReg.service";
import { UserService } from "./user.service";
import { sendWhatsappMessage } from "./registration.service";

export async function startBot(phoneNumber: string, message: string) {
  let user = await UserService.getUserByPhone(phoneNumber);

  // Handle main menu selection
  if (message === "1" || message === "2") {
    if (message === "1") {
      // Donor registration
      await UserService.updateUserState(phoneNumber, {
        currentFlow: BotFlow.REGISTRATION,
        currentStep: RegistrationStep.START,
        contextData: {},
      });
      user = await UserService.getUserByPhone(phoneNumber);
      if (!user) {
        user = await UserService.createUser({
          phoneNumber,
          currentFlow: BotFlow.REGISTRATION,
          currentStep: RegistrationStep.START,
          role: UserRole.DONOR,
        });
      }
    } else if (message === "2") {
      // Hospital registration
      await UserService.updateUserState(phoneNumber, {
        currentFlow: BotFlow.HOSPITAL_REGISTRATION,
        currentStep: HospitalRegistrationStep.START,
        contextData: {},
      });
      user = await UserService.getUserByPhone(phoneNumber);
      if (!user) {
        user = await UserService.createUser({
          phoneNumber,
          currentFlow: BotFlow.HOSPITAL_REGISTRATION,
          currentStep: HospitalRegistrationStep.START,
          role: UserRole.HOSPITAL,
        });
      }
    }
  }

  // If no user exists, show menu
  if (!user) {
    await sendWhatsappMessage(
      phoneNumber,
      "Welcome to LifeSavers! 🩸\n\n" +
        "Please select an option:\n" +
        "1. Register as Donor\n" +
        "2. Register Hospital"
    );
    return;
  }

  let currentFlow = user.currentFlow;
  let userState = user.currentStep;
  let userRole = user.role;

  console.log("Starting Process", { currentFlow, userRole, userState });

  // Route to appropriate flow
  if (currentFlow === BotFlow.HOSPITAL_REGISTRATION) {
    const response =
      await HospitalRegistrationService.processHospitalRegistration(
        userState,
        phoneNumber,
        message,
        userRole
      );
    console.log("Hospital registration response:", response);
  } else {
    await processFlow(currentFlow, userState, phoneNumber, message, userRole);
  }
}
