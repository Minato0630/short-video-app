import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Video from "../models/Video.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   MULTER CONFIG (AVATAR)
========================= */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  }
});

/* =========================
   GET ALL USERS (ADMIN ACCESS)
========================= */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

/* =========================
   GET USER PROFILE
========================= */
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username
    }).select("-password");

    if (!user) {
      return res.status(404).json("User not found");
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

/* =========================
   UPDATE PROFILE (TEXT)
========================= */
router.put("/:username", async (req, res) => {
  const { loggedInUser, name, bio, favouriteAnime } = req.body;

  if (loggedInUser !== req.params.username) {
    return res.status(403).json("Not allowed");
  }

  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { name, bio, favouriteAnime },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Profile update failed");
  }
});

/* =========================
   UPLOAD AVATAR
========================= */
router.put(
  "/avatar/:username",
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { loggedInUser } = req.body;

    if (loggedInUser !== req.params.username) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // Store avatar as Base64 Data URL directly in MongoDB
      const base64Data = req.file.buffer.toString("base64");
      const avatarPath = `data:${req.file.mimetype};base64,${base64Data}`;

      // Delete old local avatar file if it was a legacy disk path
      const existingUser = await User.findOne({
        username: req.params.username
      });

      if (existingUser?.avatar && existingUser.avatar.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", existingUser.avatar);
        try {
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (fileErr) {
          console.warn("Could not delete old avatar file:", fileErr.message);
        }
      }

      const user = await User.findOneAndUpdate(
        { username: req.params.username },
        { avatar: avatarPath },
        { new: true }
      ).select("-password");

      res.json(user);
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: "Avatar upload failed", error: err.message });
    }
  }
);

/* =========================
   DELETE USER (ADMIN ONLY)
========================= */
router.delete("/:username", async (req, res) => {
  try {
    const { requester } = req.body;
    const requestingUser = await User.findOne({ username: requester });

    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json("Not allowed");
    }

    const userToDelete = await User.findOne({ username: req.params.username });
    if (!userToDelete) {
      return res.status(404).json("User not found");
    }

    // 1. Delete user's avatar file if it was a legacy local file
    if (userToDelete.avatar && userToDelete.avatar.startsWith("/uploads/")) {
      const avatarPath = path.join(__dirname, "..", userToDelete.avatar);
      try {
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (fileErr) {
        console.warn("Could not delete avatar file:", fileErr.message);
      }
    }

    // 2. Delete user's video files from uploads folder
    const videos = await Video.find({ username: req.params.username });
    const videoUploadsDir = path.join(__dirname, "..", "uploads");
    for (const video of videos) {
      const filePath = path.join(videoUploadsDir, video.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.warn("Could not delete video file:", fileErr.message);
      }
      await Video.findByIdAndDelete(video._id);
    }

    // 3. Delete the user
    await User.findOneAndDelete({ username: req.params.username });

    res.json({ message: "User and all associated uploads deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json("Delete user failed");
  }
});

export default router;
