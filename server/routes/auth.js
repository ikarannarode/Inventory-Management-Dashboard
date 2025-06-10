import express from "express";
import User from "../models/User.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Register with email/password
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    // Create new user
    const user = new User({ name, email, password });

    await User.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login with email/password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// Firebase user registration/login
router.post("/firebase", async (req, res) => {
  try {
    const { firebaseUid, name, email, avatar } = req.body;

    // Check if user exists with Firebase UID
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // User exists, generate token
      const token = generateToken(user._id);
      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    }

    // Check if user exists with same email
    user = await User.findOne({ email });
    if (user) {
      // Link Firebase account to existing user
      user.firebaseUid = firebaseUid;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      // Create new user
      user = new User({
        firebaseUid,
        name,
        email,
        avatar: avatar || "",
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Firebase authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res
      .status(500)
      .json({ message: "Server error during Firebase authentication" });
  }
});

// Get current user
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
    },
  });
});

// Logout (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

export default router;
