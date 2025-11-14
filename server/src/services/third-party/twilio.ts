import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../../config/env";


export const client = twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);
