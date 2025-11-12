import express from "express"
import cors from "cors"
import listenerRoutes from "./routes/webhook.route"
import connectDB from "./config/db";
import { PORT } from "./config/env";

connectDB();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.get("/", (_, res) => {
  res.send("Welcome To LifeSavers🩸🩸...");
});

app.use("/webhook", listenerRoutes);

app.listen(PORT, () => console.log(`App Running At: http://localhost:${PORT}`));
