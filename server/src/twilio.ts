import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp() {
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: process.env.MY_WHATSAPP_NUMBER!, // your verified number
    body: "Your appointment is confirmed ✅",
  });
  console.log("Message sent successfully", message.sid);
}

sendWhatsApp();
