
import dotenv from "dotenv";

dotenv.config();

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/'
export const PORT = process.env.PORT || 4000;
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || '';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
export const DOJAH_BASE_URL = process.env.DOJAH_BASE_URL;
export const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
export const DOJAH_SECRET_KEY = process.env.DOJAH_SECRET_KEY;
