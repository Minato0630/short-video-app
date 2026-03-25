import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      password: hashed
    });

    await user.save();
    res.json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Register failed" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json("Invalid login");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json("Invalid login");

    const { password: _, ...safeUser } = user._doc;
    res.json({ user: safeUser });

  } catch {
    res.status(500).json("Login failed");
  }
});

export default router;