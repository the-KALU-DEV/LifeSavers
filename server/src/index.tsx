import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db"

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
