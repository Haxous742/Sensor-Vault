// controllers/someController.js
import { getIO } from "../socket/socket.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const test = async (req, res) => {
  try {
    const { message } = req.body;

    // Send data to all connected clients
    getIO().emit("new_message", { text: message, time: new Date() });

    

    res.json({ success: true, sent: message });


} catch (err) {
    console.error("Socket emit error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password required" });
    }

    // Compare with .env PASSWORD
    if (password === process.env.PASSWORD) {
      const token = jwt.sign({ authorized: true }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,  // ✅ use false only for local dev
        sameSite: "none",
        maxAge: 3600000
      });
      return res.status(200).json({ success: true, message: "Login successful" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}



export const verify = async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) return res.status(401).json({ valid: false });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
}
