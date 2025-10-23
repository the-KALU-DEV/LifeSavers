import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes"
import connectDB from "./config/db";
import { sendWhatsappMessage } from "./sendMessage";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/register", userRoutes)

app.get("/", (req, res) => {
  res.send("Code is active...");
});

// setting a server endpoint to respond to incoming message
app.post("/webhook", (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;

  console.log(`Incoming message from ${from}: ${body}`);

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message> Got your message, thanks!</Message>
    </Response>
  `);
});

// testing the automated message 
sendWhatsappMessage("Hello, this is Victor from lifesaver, testing to see if twilio is working. Be so kind to send a feedback, thank you!")

const PORT = process.env.PORT || 4000;
app.listen(PORT);
