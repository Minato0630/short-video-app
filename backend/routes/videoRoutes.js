import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Video from "../models/Video.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
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
   DELETE VIDEO (OWNER)
========================= */
router.delete("/:id", async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json("Not found");

  if (video.username !== req.body.username)
    return res.status(403).json("Not allowed");

  const filePath = path.join("uploads", video.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await Video.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
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

export default router;
