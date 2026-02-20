import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   MULTER CONFIG (AVATAR)
========================= */
const avatarDir = "uploads/avatars";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
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
  upload.single("avatar"),
  async (req, res) => {
    const { loggedInUser } = req.body;

    if (loggedInUser !== req.params.username) {
      return res.status(403).json("Not allowed");
    }

    if (!req.file) {
      return res.status(400).json("No file uploaded");
    }

    try {
      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      // 🔥 delete old avatar if exists
      const existingUser = await User.findOne({
        username: req.params.username
      });

      if (existingUser?.avatar) {
        const oldPath = "." + existingUser.avatar;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const user = await User.findOneAndUpdate(
        { username: req.params.username },
        { avatar: avatarPath },
        { new: true }
      ).select("-password");

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json("Avatar upload failed");
    }
  }
);

export default router;
