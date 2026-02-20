import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,

  filename: {
    type: String,
    required: true
  },

  username: {
    type: String,
    required: true
  },

  likes: {
    type: [String], // usernames
    default: []
  },

  savedBy: {
    type: [String], // usernames
    default: []
  },

  views: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Video", videoSchema);
