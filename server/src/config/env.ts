
import dotenv from "dotenv";

dotenv.config();

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/'
export const PORT = process.env.PORT || 4000;
export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
export const GCP_STORAGE_BUCKET = process.env.GCP_STORAGE_BUCKET;
export const GCP_CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL;
export const GCP_PRIVATE_KEY = process.env.GCP_PRIVATE_KEY;
export const DOJAH_BASE_URL = process.env.DOJAH_BASE_URL;
export const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
export const DOJAH_SECRET_KEY = process.env.DOJAH_SECRET_KEY;
export const ZEEH_PRODUCTION_URL = process.env.ZEEH_PRODUCTION_URL;
export const ZEEH_SECRET_KEY = process.env.ZEEH_SECRET_KEY;
