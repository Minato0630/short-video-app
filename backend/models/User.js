import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  username: { type: String, unique: true, required: true },

  email: { type: String, unique: true, required: true },

  password: { type: String, required: true },

  favouriteAnime: { type: String, default: "" },

  bio: { type: String, default: "" },

  avatar: { type: String, default: "" },

  followers: { type: [String], default: [] },

  following: { type: [String], default: [] },

  likedVideos: { type: [String], default: [] },

  savedVideos: { type: [String], default: [] },
  avatar: {
  type: String,
  default: ""
},


  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
