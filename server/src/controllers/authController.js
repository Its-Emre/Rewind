import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});

// POST /api/auth/register — invite-gated: when FAMILY_CODE is set on the
// server, the request must carry it. (Unset = open, local dev only.)
export const register = async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const familyCode = process.env.FAMILY_CODE;
    if (familyCode && inviteCode !== familyCode) {
      return res.status(403).json({ message: "That invite code doesn't match. Ask the family for the current code." });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() });
    if (!user || !(await user.matchPassword(password || ""))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
