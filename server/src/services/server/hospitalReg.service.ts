import { Hospital } from "../../models/Hospital";
import {
  BotFlow,
  HospitalRegistrationStep,
  UserRole,
} from "../../models/Enums";
import { User } from "../../models/User";
import { sendWhatsappMessage } from "./registration.service";

interface HospitalRegistrationContext {
  hospitalName?: string;
  licenseNumber?: string;
  contact?: string;
  address?: string;
  adminName?: string;
  adminPhone?: string;
  pictures?: string[];
}

export class HospitalRegistrationService {
  /**
   * Main hospital flow processor
   */
  static async processHospitalFlow(
    flow: BotFlow,
    state: string,
    from: string,
    message: string,
    role: UserRole
  ): Promise<string> {
    if (flow === BotFlow.HOSPITAL_REGISTRATION) {
      return await this.processHospitalRegistration(state, from, message, role);
    }
    const msg = "Type '2' to start hospital registration.";
    await sendWhatsappMessage(from, msg);
    return msg;
  }

  /**
   * Processes hospital registration step by step
   */
  static async processHospitalRegistration(
    currentStep: string,
    from: string,
    message: string,
    role?: UserRole
  ): Promise<string> {
    const user = await User.findOne({ phoneNumber: from });
    let context: HospitalRegistrationContext = user?.contextData || {};

    switch (currentStep) {
      case HospitalRegistrationStep.START:
        await this.updateUserState(
          from,
          HospitalRegistrationStep.HOSPITAL_NAME,
          {}
        );
        const startMsg = "🏥 HOSPITAL REGISTRATION\nHospital Name:";
        await sendWhatsappMessage(from, startMsg);
        return startMsg;

      case HospitalRegistrationStep.HOSPITAL_NAME:
        context.hospitalName = message.trim();
        await this.updateUserState(
          from,
          HospitalRegistrationStep.LICENSE_NUMBER,
          context
        );
        const licenseMsg = "Hospital License Number:";
        await sendWhatsappMessage(from, licenseMsg);
        return licenseMsg;

      case HospitalRegistrationStep.LICENSE_NUMBER:
        context.licenseNumber = message.trim();
        await this.updateUserState(
          from,
          HospitalRegistrationStep.CONTACT,
          context
        );
        const contactMsg = "Hospital Contact Number:";
        await sendWhatsappMessage(from, contactMsg);
        return contactMsg;

      case HospitalRegistrationStep.CONTACT:
        context.contact = message.trim();
        await this.updateUserState(
          from,
          HospitalRegistrationStep.ADDRESS,
          context
        );
        const addressMsg = "Hospital Address:";
        await sendWhatsappMessage(from, addressMsg);
        return addressMsg;

      case HospitalRegistrationStep.ADDRESS:
        context.address = message.trim();
        await this.updateUserState(
          from,
          HospitalRegistrationStep.ADMIN_NAME,
          context
        );
        const adminNameMsg = "Admin Full Name:";
        await sendWhatsappMessage(from, adminNameMsg);
        return adminNameMsg;

      case HospitalRegistrationStep.ADMIN_NAME:
        context.adminName = message.trim();
        await this.updateUserState(
          from,
          HospitalRegistrationStep.ADMIN_PHONE,
          context
        );
        const adminPhoneMsg = "Admin Phone Number:";
        await sendWhatsappMessage(from, adminPhoneMsg);
        return adminPhoneMsg;

      case HospitalRegistrationStep.ADMIN_PHONE:
        context.adminPhone = message.trim();
        await this.updateUserState(
          from,
          HospitalRegistrationStep.PICTURES,
          context
        );
        const picturesMsg =
          "Send physical pictures of the hospital (URLs or attachments):";
        await sendWhatsappMessage(from, picturesMsg);
        return picturesMsg;

      case HospitalRegistrationStep.PICTURES:
        context.pictures = message.split(",").map((url) => url.trim());

        // Create hospital record
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

        // Reset user state
        await this.updateUserState(from, HospitalRegistrationStep.COMPLETE, {});

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

  /**
   * Updates user state in database
   */
  private static async updateUserState(
    phoneNumber: string,
    currentStep: string,
    contextData: HospitalRegistrationContext
  ): Promise<void> {
    await User.findOneAndUpdate(
      { phoneNumber },
      {
        currentFlow: BotFlow.HOSPITAL_REGISTRATION,
        currentStep,
        contextData,
      },
      { upsert: true }
    );
  }
}
