import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import registrationRoutes from "./routes/donorRegistration";
import webhookRoutes from "./routes/webhook.routes";
import connectDB from "./config/db";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api", registrationRoutes);
app.use("/webhook", webhookRoutes);

// app.get("/", (req, res) => {
//   res.send("Code is active...");
// });

app.get("/", (req, res) => {
  res.json({ 
    message: "LifeSavers Blood Donation Bot API is running",
    status: "active",
    timestamp: new Date().toISOString()
  });
});

//health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "blood-donation-bot",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// setting a server endpoint to respond to incoming message
// app.post("/webhook", (req, res) => {
//   const from = req.body.From;
//   const body = req.body.Body;

//   console.log(`Incoming message from ${from}: ${body}`);

//   res.set("Content-Type", "text/xml");
//   res.send(`
//     <Response>
//       <Message> Got your message, thanks!</Message>
//     </Response>
//   `);
// });

// // testing the automated message 
// sendWhatsappMessage("Hello, this is Victor from lifesaver, testing to see if twilio is working. Be so kind to send a feedback, thank you!")

const PORT = process.env.PORT || 4000;
app.listen(PORT);
