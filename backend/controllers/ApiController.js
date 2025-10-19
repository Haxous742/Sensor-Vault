// controllers/someController.js
import { getIO } from "../socket/socket.js";

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
