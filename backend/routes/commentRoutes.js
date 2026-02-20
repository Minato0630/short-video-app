import express from "express";
import Comment from "../models/Comment.js";

const router = express.Router();

router.post("/:videoId", async (req, res) => {
  const comment = new Comment({
    videoId: req.params.videoId,
    username: req.body.username,
    text: req.body.text
  });
  await comment.save();
  res.json(comment);
});

router.get("/:videoId", async (req, res) => {
  const comments = await Comment.find({ videoId: req.params.videoId });
  res.json(comments);
});

export default router;
