import { Donor } from "../../models/Donor";
import { UserRole, HospitalRegistrationStep, BotFlow, RegistrationStep } from "../../models/Enums";
import { Hospital } from "../../models/Hospital";
import { User } from "../../models/User";
import { userState } from "../../types";
import { sendWhatsappMessage } from "./bot.service";
import { UserService } from "./user.service";

interface HospitalRegistrationContext {
    hospitalName?: string;
    licenseNumber?: string;
    contact?: string;
    address?: string;
    adminName?: string;
    adminPhone?: string;
    pictures?: string[];
}

export async function getRegistrationType(
    from: string
) {
    await Promise.all([
        UserService.updateUserState(from, {
            currentFlow: BotFlow.PICK_REG_FLOW,
            currentStep: RegistrationStep.START
        }),
        sendWhatsappMessage(
            from,
            "Welcome to LifeSavers! 🩸\n\nPlease choose:\n1. Register as a Donor\n2. Register as a Hospital"
        )])
}

export async function setRegistrationType(
    from: string, message: string
) {
    switch (message) {
        case '2':
            UserService.updateUserState(from, {
                currentFlow: BotFlow.HOSPITALREGISTRATION,
                currentStep: HospitalRegistrationStep.START
            });

            await processHospitalRegistration(HospitalRegistrationStep.START, from, message, UserRole.HOSPITAL);
            break;
        case '1':
            UserService.updateUserState(from, {
                currentFlow: BotFlow.DONORREGISTRATION,
                currentStep: RegistrationStep.START
            });

            await processDonorRegistration(RegistrationStep.START, from, message, UserRole.DONOR)
            break;
        default:
            await sendWhatsappMessage(
                from,
                "Oops! Thats an incorrect option\n\nPlease choose:\n1. Register as User\n2. Register as Hospital"
            )
            break
    }
}


export const processHospitalRegistration = async (
    currentStep: string,
    from: string,
    message: string,
    role?: UserRole
) => {
    const user = await User.findOne({ phoneNumber: from });
    let context: HospitalRegistrationContext = user?.contextData || {};

    switch (currentStep) {
        case HospitalRegistrationStep.START:
            await UserService.updateUserState(
                from,
                { currentStep: HospitalRegistrationStep.HOSPITAL_NAME }
            );
            const startMsg = "🏥 What is the name of your Hospital?";
            await sendWhatsappMessage(from, startMsg);
            return startMsg;

        case HospitalRegistrationStep.HOSPITAL_NAME:
            context.hospitalName = message.trim();
            await UserService.updateUserState(
                from,
                {
                    currentStep: HospitalRegistrationStep.LICENSE_NUMBER,
                    contextData: context
                },
            );
            const licenseMsg = "Hospital License Number:";
            await sendWhatsappMessage(from, licenseMsg);
            return licenseMsg;

        case HospitalRegistrationStep.LICENSE_NUMBER:
            context.licenseNumber = message.trim();
            await UserService.updateUserState(
                from,
                {
                    currentStep: HospitalRegistrationStep.CONTACT,
                    contextData: context
                },
            );
            const contactMsg = "Hospital Contact Number:";
            await sendWhatsappMessage(from, contactMsg);
            return contactMsg;

        case HospitalRegistrationStep.CONTACT:
            context.contact = message.trim();
            await UserService.updateUserState(
                from,
                {
                    currentStep: HospitalRegistrationStep.ADDRESS,
                    contextData: context

                },
            );
            const addressMsg = "Hospital Address:";
            await sendWhatsappMessage(from, addressMsg);
            return addressMsg;

        case HospitalRegistrationStep.ADDRESS:
            context.address = message.trim();
            await UserService.updateUserState(
                from,
                {
                    currentStep: HospitalRegistrationStep.ADMIN_NAME,
                    contextData: context
                },
            );
            const adminNameMsg = "Admin Full Name:";
            await sendWhatsappMessage(from, adminNameMsg);
            return adminNameMsg;

        case HospitalRegistrationStep.ADMIN_NAME:
            context.adminName = message.trim();
            await UserService.updateUserState(
                from,
                {
                    currentStep: HospitalRegistrationStep.ADMIN_PHONE,
                    contextData: context
                },
            );
            const adminPhoneMsg = "Admin Phone Number:";
            await sendWhatsappMessage(from, adminPhoneMsg);
            return adminPhoneMsg;

        case HospitalRegistrationStep.ADMIN_PHONE:
            context.adminPhone = message.trim();
            await UserService.updateUserState(
                from,
                {
                    currentStep: HospitalRegistrationStep.PICTURES,
                    contextData: context
                },
            );
            const picturesMsg =
                "Send physical pictures of the hospital (URLs or attachments):";
            await sendWhatsappMessage(from, picturesMsg);
            return picturesMsg;

        case HospitalRegistrationStep.PICTURES:
            context.pictures = message.split(",").map((url) => url.trim());

            const hospital = await Hospital.create({
                hospitalName: context.hospitalName,
                licenseNumber: context.licenseNumber,
                contact: context.contact,
                address: context.address,
                adminName: context.adminName,
                adminPhone: context.adminPhone,
                pictures: context.pictures,
                phoneNumber: from,
                role: role || UserRole.HOSPITAL,
                tempCredits: 0,
                verificationStatus: "PENDING",
            });

            await UserService.updateUserState(from, {
                currentFlow: BotFlow.HOSPITALVERIFICATION,
                currentStep: HospitalRegistrationStep.COMPLETE,
                contextData: {}
            });

            const successMsg = `🎉 Registration submitted! Ref: ${hospital.referenceNumber}\nVerification: 24-48 hours. Temp credits: 0`;
            await sendWhatsappMessage(from, successMsg);
            return successMsg;

        default:
            const defaultMsg =
                "I didn't understand that. Please start again by typing '2' to register your hospital.";
            await sendWhatsappMessage(from, defaultMsg);
            return defaultMsg;
    }
}

export async function processDonorRegistration(
    currentStep: userState,
    from: string,
    message: string,
    role?: UserRole
) {

    const user = await User.findOne({ phoneNumber: from });
    console.log("Processing Donor Registration Now", {
        currentStep,
        from,
        message,
        role,
    });
    console.log({ contex: user?.contextData })

    let contextData: {
        name?: string;
        gender?: string;
        bloodGroup?: string;
        location?: { type: "Point"; coordinates: [number, number] };
        genotype?: string;
    } = user?.contextData || {};

    switch (currentStep) {
        case RegistrationStep.START:
            console.log("In Start");
            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.NAME,
            });
            return await sendWhatsappMessage(
                from,
                "Hello Again! What's your full name?"
            );

        case RegistrationStep.NAME:
            contextData.name = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.GENDER,
                contextData: contextData,
            });
            return await sendWhatsappMessage(
                from,
                "Got it! What's your gender? (Male/Female)"
            );

        case RegistrationStep.GENDER:
            console.log("In Gender");
            contextData.gender = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.BLOOD_GROUP,
                contextData,
            });
            return await sendWhatsappMessage(
                from,
                "Please enter your blood group (e.g. A+, O-, etc.)"
            );

        case RegistrationStep.BLOOD_GROUP:
            contextData.bloodGroup = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.GENOTYPE,
                contextData
            });
            return await sendWhatsappMessage(
                from,
                "Now, what's your genotype? (AA, AS, SS, etc.)"
            );

        case RegistrationStep.GENOTYPE:
            console.log("In Genotype");
            contextData.genotype = message;

            await UserService.updateUserState(from, {
                currentStep: RegistrationStep.LOCATION,
                contextData
            });
            return await sendWhatsappMessage(
                from,
                "Please share your current location or area name."
            );

        case RegistrationStep.LOCATION:
            console.log("In Location");
            contextData.location = message as any;

            await Donor.create({
                ...contextData,
                userId: user?._id,
                phoneNumber: from,
                role: role,
            });

            await UserService.updateUserState(from, {
                currentFlow: BotFlow.DONORVERIFICATION,
                currentStep: "Start",
                contextData: { message: "Donor Is Now Registered" },
            });

            return await sendWhatsappMessage(
                from,
                "✅ Registration complete! You're now part of LifeSavers.\nLet's Get You Verified"
            );

        default:
            return await Promise.all(
                [
                    sendWhatsappMessage(
                        from,
                        "I didn't understand that. Type 'restart' to begin again."
                    )]
            )
    }
}