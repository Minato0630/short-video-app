import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import videoRoutes from "./routes/videoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
let connectPromise;

dotenv.config({ path: path.join(__dirname, ".env") });

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.MONGO_URI);
  }

  try {
    await connectPromise;
    return mongoose.connection;
  } catch (error) {
    connectPromise = undefined;
    throw error;
  }
}

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
   ROUTES
========================= */
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ MongoDB Atlas error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* =========================
   ROOT ROUTE (FIX)
========================= */
app.get("/", (req, res) => {
  res.send("✅ Anime Shorts Backend is running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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
