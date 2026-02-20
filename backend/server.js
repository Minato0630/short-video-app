import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* LOCAL MONGODB CONNECTION */
mongoose.connect("mongodb://127.0.0.1:27017/shortvideo");

app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
