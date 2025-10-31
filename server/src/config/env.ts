
import dotenv from "dotenv";

dotenv.config();

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/'
export const PORT = process.env.PORT || 4000;
