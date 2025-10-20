import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

export async function sendWhatsappMessage(text: string) {
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: process.env.MY_WHATSAPP_NUMBER!,
    body: text,
  });

  console.log("Message sent with SID:", message.sid);
}
