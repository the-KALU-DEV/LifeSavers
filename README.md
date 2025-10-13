# LifeSavers

## 1. Welcome
Whatsapp-powered blood donation platform connecting donors and hospitals in real time.


## 🗂️ 2. Folder Structure

```
whatsapp-bot/
│
├── .env
├── package.json
├── server.js
│
├── src/
│   ├── config/
│   │   └── whatsapp.js          # Cloud API setup
│   ├── services/
│   │   └── openaiService.js     # Optional AI integration
│   ├── controllers/
│   │   └── webhookController.js # Main webhook logic
│   ├── utils/
│   │   └── sendMessage.js       # Helper to send WhatsApp messages
│   └── routes/
│       └── webhook.js           # Webhook route definition
│
└── README.md
```

---

## ⚙️ 3. Installation

```bash
mkdir whatsapp-bot && cd whatsapp-bot
npm init -y
npm install express axios dotenv body-parser
```

(For AI integration)

```bash
npm install openai
```

Create a `.env` file:

```bash
WHATSAPP_TOKEN=your_whatsapp_access_token
VERIFY_TOKEN=your_webhook_verify_token
PHONE_NUMBER_ID=your_meta_phone_number_id
OPENAI_API_KEY=your_openai_key   # Optional
```

---

## 🚀 4. Code Setup

### **server.js**

```js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import webhookRouter from "./src/routes/webhook.js";

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use("/webhook", webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

---

### **src/routes/webhook.js**

```js
import express from "express";
import { handleWebhook, verifyWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// For WhatsApp verification
router.get("/", verifyWebhook);

// For receiving messages
router.post("/", handleWebhook);

export default router;
```

---

### **src/controllers/webhookController.js**

```js
import sendMessage from "../utils/sendMessage.js";
import { getAIReply } from "../services/openaiService.js";

export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body;

    console.log(`📩 Message from ${from}: ${text}`);

    // Basic reply logic
    let reply = "Hello 👋, how can I help you today?";

    // Optional: AI response
    if (text) {
      reply = await getAIReply(text);
    }

    await sendMessage(from, reply);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
};
```

---

### **src/utils/sendMessage.js**

```js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

export default async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}
```

---

### **src/services/openaiService.js**

```js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIReply(prompt) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}
```

---

## 🧠 5. How It Works

1. Meta sends a **GET** request to your webhook URL for verification (you respond with the challenge).
2. When a user sends a message:

   * WhatsApp Cloud API sends a **POST** request to your webhook.
   * You process it and reply using `sendMessage()`.
3. The reply appears instantly in the user’s WhatsApp chat.

---

