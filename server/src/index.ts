import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes"
// import connectDB from "./config/db";

dotenv.config();
// connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/register", userRoutes)

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
