import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // ✅ Validate input
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({
      message: "Registered successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json("Missing credentials");
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json("Invalid login");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json("Invalid login");

    // ❗ DO NOT SEND PASSWORD
    const { password: _, ...safeUser } = user._doc;

    res.json({
      user: safeUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Login failed");
  }
});

export default router;
