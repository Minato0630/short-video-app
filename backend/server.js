import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
dotenv.config();

import videoRoutes from "./routes/videoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB Atlas error:", err));

/* =========================
   ROUTES
========================= */
app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* =========================
   ROOT ROUTE (FIX)
========================= */
app.get("/", (req, res) => {
  res.send("✅ Anime Shorts Backend is running");
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
