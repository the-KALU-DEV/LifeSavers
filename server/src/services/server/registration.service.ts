import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } from "../../config/env";

const accountSid = TWILIO_ACCOUNT_SID
const authToken = TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export async function sendWhatsappMessage(to: string, text: string) {
    console.log(`Sending Message to ${to}: ${text}`)
    await client.messages.create({
        from: TWILIO_WHATSAPP_NUMBER,
        to: `${to}`,
        body: text
    });
}
