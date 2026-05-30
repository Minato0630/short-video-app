import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Video from "../models/Video.js";
import User from "../models/User.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"));
  }
});

/* =========================
   UPLOAD VIDEO
========================= */
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, description, username } = req.body;
    if (!username) return res.status(400).json("Username required");

    const video = new Video({
      title,
      description,
      filename: req.file.filename,
      username
    });

    await video.save();
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json("Upload failed");
  }
});

/* =========================
   GET ALL VIDEOS
========================= */
router.get("/", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

/* =========================
   GET VIDEO BY ID
========================= */
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json("Video not found");
    res.json(video);
  } catch (err) {
    res.status(500).json("Server error");
  }
});

/* =========================
   DELETE VIDEO (OWNER OR ADMIN)
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json("Not found");

    const user = await User.findOne({ username: req.body.username });
    const isAdmin = user && user.isAdmin;

    if (video.username !== req.body.username && !isAdmin)
      return res.status(403).json("Not allowed");

    const filePath = path.join(uploadsDir, video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json("Delete failed");
  }
});

/* =========================
   LIKE / UNLIKE VIDEO
========================= */
router.put("/like/:id", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json("Username required");

    const video = await Video.findById(req.params.id);
    const user = await User.findOne({ username });

    if (!video || !user) return res.status(404).json("Not found");

    const liked = video.likes.includes(username);

    if (liked) {
      video.likes.pull(username);
      user.likedVideos.pull(video._id);
    } else {
      video.likes.push(username);
      user.likedVideos.push(video._id);
    }

    await video.save();
    await user.save();

    res.json({
      liked: !liked,
      likesCount: video.likes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Like failed");
  }
});

/* =========================
   SAVE / UNSAVE VIDEO
========================= */
router.put("/save/:id", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json("Username required");

    const video = await Video.findById(req.params.id);
    const user = await User.findOne({ username });

    if (!video || !user) return res.status(404).json("Not found");

    const saved = user.savedVideos.includes(video._id);

    if (saved) {
      user.savedVideos.pull(video._id);
      video.savedBy.pull(username);
    } else {
      user.savedVideos.push(video._id);
      video.savedBy.push(username);
    }

    await user.save();
    await video.save();

    res.json({
      saved: !saved
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Save failed");
  }
});

/* =========================
   VIEW COUNT
========================= */
router.put("/view/:id", async (req, res) => {
  await Video.findByIdAndUpdate(req.params.id, {
    $inc: { views: 1 }
  });
  res.json({ success: true });
});

/* =========================
   DOWNLOAD VIDEO FILE
========================= */
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    const { title, quality, format } = req.query;
    const cleanTitle = (title || "video").trim().replace(/[^a-zA-Z0-9]/g, "_");
    const selectedQuality = quality || "720p";
    const originalExt = path.extname(req.params.filename).substring(1) || "mp4";
    const selectedFormat = format || originalExt;
    
    const downloadName = `${cleanTitle}_${selectedQuality}.${selectedFormat}`;
    res.download(filePath, downloadName);
  } else {
    res.status(404).send("File not found");
  }
});

export default router;
