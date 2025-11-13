import { Donor } from "../../models/Donor";
import { BotFlow, RegistrationStep, UserRole } from "../../models/Enums";
import { User } from "../../models/User";
import { processFlow } from "./donor.service";
import { UserService } from "./user.service";

export async function startBot(phoneNumber: string, message: string, mediaUrl?: string | null) {

    let user =  await UserService.getUserByPhone(phoneNumber);

    if (!user) {
        user = await UserService.createUser({
            phoneNumber,
            currentFlow: BotFlow.REGISTRATION,
            currentStep: RegistrationStep.START,
            role: UserRole.DONOR
        });
    }

    let currentFlow = user.currentFlow;
    let userState = user.currentStep;
    let userRole = user.role;

    console.log("Starting Process", {currentFlow, userRole, userState})

    await processFlow(currentFlow, userState, phoneNumber, message, userRole);
}
