import { askFullName, sayHowItWorks, sayWelcome } from "../../messages/startup.messages";
import { Donor } from "../../models/Donor";
import { BotFlow, RegistrationStep, UserRole } from "../../models/Enums";
import { sendWhatsappMessage } from "./registration.service";
import { getState, setState } from "./state.service";
import { UserService } from "./user.service";


type userState = RegistrationStep | string

export async function processFlow(flow: BotFlow, state: userState, from: string, message: string, role: UserRole) {
    switch (flow) {
        case BotFlow.REGISTRATION:
            console.log("Registering")
            await processRegistration(state, from, message, role);
            break;

        case BotFlow.DONATION:
            await processDonation(from, message);
            break;

        case BotFlow.VERIFICATION:
            await processVerification(from, `Thanks, ${message}! Please share your location.`);
            break;

        case BotFlow.MATCHING:
            await sendWhatsappMessage(from, "✅ Location saved! Now, send your blood group (e.g., O+, A-).");
            break;

        default:
            await processRegistration(state, from, "Type 'hi' to restart.");
    }
}

export async function processRegistration(currentStep: userState, from: string, message: string, role?: UserRole) {
    let registrationContextData: {
        name?: string,
        gender?: string,
        bloodGroup?: string,
        location?: { type: "Point", coordinates: [number, number] },
        genotype?: string
    } = {};

    console.log("Processing Registration Now", { currentStep, from, message, role });

    switch (currentStep) {
        case RegistrationStep.START:
            console.log("In Start");
            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.NAME
            });
            return await sendWhatsappMessage(from, "Welcome to LifeSavers! What's your full name?");

        case RegistrationStep.NAME:
            console.log("In Name");
            // Get existing context data if any
            const user = await UserService.getUserByPhone(from);
            registrationContextData = user?.contextData || {};
            registrationContextData.name = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.GENDER,
                contextData: registrationContextData
            });
            return await sendWhatsappMessage(from, "Got it! What's your gender? (Male/Female)");

        case RegistrationStep.GENDER:
            console.log("In Gender");
            const user2 = await UserService.getUserByPhone(from);
            registrationContextData = user2?.contextData || {};
            registrationContextData.gender = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.BLOOD_GROUP,
                contextData: registrationContextData
            });
            return await sendWhatsappMessage(from, "Please enter your blood group (e.g. A+, O-, etc.)");

        case RegistrationStep.BLOOD_GROUP:
            console.log("In Blood Group");
            const user3 = await UserService.getUserByPhone(from);
            registrationContextData = user3?.contextData || {};
            registrationContextData.bloodGroup = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.GENOTYPE,
                contextData: registrationContextData
            });
            return await sendWhatsappMessage(from, "Now, what's your genotype? (AA, AS, SS, etc.)");

        case RegistrationStep.GENOTYPE:
            console.log("In Genotype");
            const user4 = await UserService.getUserByPhone(from);
            registrationContextData = user4?.contextData || {};
            registrationContextData.genotype = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.LOCATION,
                contextData: registrationContextData
            });
            return await sendWhatsappMessage(from, "Please share your current location or area name.");

        case RegistrationStep.LOCATION:
            console.log("In Location");
            const user5 = await UserService.getUserByPhone(from);
            registrationContextData = user5?.contextData || {};
            registrationContextData.location = message as any;

            await Donor.create({
                ...registrationContextData,
                phoneNumber: from,
                role: role,
            });

            await UserService.updateUserState(from, {
                currentFlow: BotFlow.VERIFICATION,
                currentStep: "Start",
                contextData: { message: "Donor Is Now Registered" }
            });

            return await sendWhatsappMessage(from, "✅ Registration complete! You're now part of LifeSavers.\nLet's Get You Verified");

        default:
            return await sendWhatsappMessage(from, "I didn't understand that. Please start again by typing 'register'.");
    }
}

export async function processMatching(from: string, message: string) {
    const state = getState(from);

    switch (state) {
        case "WELCOME":
            await sendWhatsappMessage(from, sayWelcome());
            setState(from, "CHOOSING_OPTION");
            break;

        case "CHOOSING_OPTION":
            if (message === "1") {
                await sendWhatsappMessage(from, askFullName());
                setState(from, "ASKING_NAME");
            } else if (message === "2") {
                await sendWhatsappMessage(from, sayHowItWorks());
                setState(from, "WELCOME");
            } else {
                await sendWhatsappMessage(from, "Please type 1 or 2 to continue.");
            }
            break;

        case "ASKING_NAME":
            await sendWhatsappMessage(from, `Thanks, ${message}! Please share your location.`);
            setState(from, "ASKING_LOCATION");
            break;

        case "ASKING_LOCATION":
            await sendWhatsappMessage(from, "✅ Location saved! Now, send your blood group (e.g., O+, A-).");
            setState(from, "ASKING_BLOOD_GROUP");
            break;

        case "ASKING_BLOOD_GROUP":
            await sendWhatsappMessage(from, `🎉 Registration complete!\nDonor ID: DON-${Math.floor(Math.random() * 9999)}-OG`);
            setState(from, "REGISTERED");
            break;

        default:
            await sendWhatsappMessage(from, "Type 'hi' to restart.");
            setState(from, "WELCOME");
    }
}

export async function processDonation(from: string, message: string) {
    const state = getState(from);

    switch (state) {
        case "WELCOME":
            await sendWhatsappMessage(from, sayWelcome());
            setState(from, "CHOOSING_OPTION");
            break;

        case "CHOOSING_OPTION":
            if (message === "1") {
                await sendWhatsappMessage(from, askFullName());
                setState(from, "ASKING_NAME");
            } else if (message === "2") {
                await sendWhatsappMessage(from, sayHowItWorks());
                setState(from, "WELCOME");
            } else {
                await sendWhatsappMessage(from, "Please type 1 or 2 to continue.");
            }
            break;

        case "ASKING_NAME":
            await sendWhatsappMessage(from, `Thanks, ${message}! Please share your location.`);
            setState(from, "ASKING_LOCATION");
            break;

        case "ASKING_LOCATION":
            await sendWhatsappMessage(from, "✅ Location saved! Now, send your blood group (e.g., O+, A-).");
            setState(from, "ASKING_BLOOD_GROUP");
            break;

        case "ASKING_BLOOD_GROUP":
            await sendWhatsappMessage(from, `🎉 Registration complete!\nDonor ID: DON-${Math.floor(Math.random() * 9999)}-OG`);
            setState(from, "REGISTERED");
            break;

        default:
            await sendWhatsappMessage(from, "Type 'hi' to restart.");
            setState(from, "WELCOME");
    }
}

export async function processVerification(from: string, message: string) {
    const state = getState(from);

    switch (state) {
        case "WELCOME":
            await sendWhatsappMessage(from, sayWelcome());
            setState(from, "CHOOSING_OPTION");
            break;

        case "CHOOSING_OPTION":
            if (message === "1") {
                await sendWhatsappMessage(from, askFullName());
                setState(from, "ASKING_NAME");
            } else if (message === "2") {
                await sendWhatsappMessage(from, sayHowItWorks());
                setState(from, "WELCOME");
            } else {
                await sendWhatsappMessage(from, "Please type 1 or 2 to continue.");
            }
            break;

        case "ASKING_NAME":
            await sendWhatsappMessage(from, `Thanks, ${message}! Please share your location.`);
            setState(from, "ASKING_LOCATION");
            break;

        case "ASKING_LOCATION":
            await sendWhatsappMessage(from, "✅ Location saved! Now, send your blood group (e.g., O+, A-).");
            setState(from, "ASKING_BLOOD_GROUP");
            break;

        case "ASKING_BLOOD_GROUP":
            await sendWhatsappMessage(from, `🎉 Registration complete!\nDonor ID: DON-${Math.floor(Math.random() * 9999)}-OG`);
            setState(from, "REGISTERED");
            break;

        default:
            await sendWhatsappMessage(from, "Type 'hi' to restart.");
            setState(from, "WELCOME");
    }
}
