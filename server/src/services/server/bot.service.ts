import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } from "../../config/env";
import { BotFlow, RegistrationStep, UserRole } from "../../models/Enums";
import { userState } from "../../types";
import { VerificationHandler } from "../../utils/handlers/verification.handler";
import { processDonation } from "./donation.service";
import { getRegistrationType, processDonorRegistration, processHospitalRegistration, setRegistrationType } from "./registration.service";
import { UserService } from "./user.service";


export async function startBot(phoneNumber: string, message: string) {

    let user = await UserService.getUserByPhone(phoneNumber);

    if (!user) {
        user = await UserService.createUser({
            phoneNumber,
            currentFlow: BotFlow.WELCOME,
            currentStep: RegistrationStep.GET_TYPE,
            role: UserRole.DONOR
        });
    }

    let currentFlow = user.currentFlow;
    let userState = user.currentStep;
    let userRole = user.role;

    console.log("Starting Process", { currentFlow, userRole, userState })

    await processFlow(currentFlow, userState, phoneNumber, message, userRole);
}

export async function processFlow(
    flow: BotFlow,
    state: userState,
    from: string,
    message: string,
    role: UserRole
) {

    switch (flow) {
        case BotFlow.WELCOME:
            console.log("Welcoming New Person");
            return await getRegistrationType(from);
        case BotFlow.PICK_REG_FLOW:
            return await setRegistrationType(from, message);
        case BotFlow.DONORREGISTRATION:
            await processDonorRegistration(state, from, message, role);
            break;
        case BotFlow.HOSPITALREGISTRATION:
            await processHospitalRegistration(state, from, message, role)
            break;
        case BotFlow.DONATION:
            await processDonation(from, message);
            break;

        case BotFlow.DONORVERIFICATION:
            await VerificationHandler.processVerification(state, from, message, role);
            break;
        case BotFlow.MATCHING:
            await sendWhatsappMessage(
                from,
                "✅ Location saved! Now, send your blood group (e.g., O+, A-)."
            );
            break;

        default:
            await sendWhatsappMessage(
                from,
                "Welcome to LifeSavers! 🩸\n\nPlease choose:\n1. Register as User\n2. Register as Hospital"
            );
    }
}

export async function sendWhatsappMessage(to: string, text: string) {
    const accountSid = TWILIO_ACCOUNT_SID
    const authToken = TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    console.log(`Sending Message to ${to}: ${text}`)
    await client.messages.create({
        from: TWILIO_WHATSAPP_NUMBER,
        to: `${to}`,
        body: text
    });
}