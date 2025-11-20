import {
  askFullName,
  sayHowItWorks,
  sayWelcome,
} from "../../messages/startup.messages";
import { Donor } from "../../models/Donor";
import {
  BotFlow,
  RegistrationStep,
  UserRole,
  HospitalRegistrationStep,
} from "../../models/Enums";
import { UserService } from "./user.service";
import { userState } from "../../types";
import { sendWhatsappMessage } from "./bot.service";







// export async function processMatching(from: string, message: string) {
//   await sendWhatsappMessage(from, "Matching feature coming soon!");
// }

export async function processDonation(from: string, message: string) {
  //await sendWhatsappMessage(from, "Donation feature coming soon!");
}

// export async function processVerification(from: string, message: string) {
//   await sendWhatsappMessage(from, "Verification feature coming soon!");
// }
