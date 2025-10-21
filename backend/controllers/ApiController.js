// controllers/someController.js
import { getIO } from "../socket/socket.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Team from "../models/Team.js";
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

//=====================================================================================================================================

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
        maxAge: 360000000
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

//=====================================================================================================================================

let interval = null;
let activeTeam = null;
let sessionStart = null; // track current running session start time

export const start = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team) return res.status(400).json({ success: false, message: "Team name is required" });

    const existingTeam = await Team.findOne({ name: team });
    if (!existingTeam) return res.status(404).json({ success: false, message: "Team not found" });

    const MAX_DURATION = 15 * 60;

    if (existingTeam.timeTaken >= MAX_DURATION) {
      return res.json({ success: false, message: "Game already completed for this team" });
    }

    // Set startedAt only the very first time ever
    if (!existingTeam.startedAt) {
      existingTeam.startedAt = new Date();
      await existingTeam.save();
      console.log(`⏱ Timer started for team ${team}`);
    } else {
      console.log(`⏱ Resuming timer for team ${team}`);
    }

    existingTeam.current = true;
    await existingTeam.save();

    const io = getIO();

    // Clear previous timer if another team's timer was running
    if (interval && activeTeam !== team) {
      clearInterval(interval);
      interval = null;
    }

    activeTeam = team;
    sessionStart = new Date(); // current session start time
    const baseTime = existingTeam.timeTaken || 0;

    if (interval) clearInterval(interval);
    interval = setInterval(async () => {
      const now = new Date();
      const elapsedThisSession = Math.floor((now - sessionStart) / 1000);
      const totalElapsed = baseTime + elapsedThisSession;

      io.emit("timer_update", { team, time: totalElapsed });

      // Auto-stop at 15 minutes
      if (totalElapsed >= MAX_DURATION) {
        clearInterval(interval);
        interval = null;
        activeTeam = null;
        sessionStart = null;

        existingTeam.timeTaken = MAX_DURATION;
        existingTeam.current = false;
        await existingTeam.save();

        io.emit("timer_update", { team, time: MAX_DURATION });
        console.log(`🛑 Timer auto-stopped for ${team} (15 minutes reached)`);
      }
    }, 1000);

    res.json({ success: true, message: `Timer started/resumed for ${team}` });
  } catch (err) {
    console.error("Start error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const stop = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team) return res.status(400).json({ success: false, message: "Team name is required" });

    const existingTeam = await Team.findOne({ name: team });
    if (!existingTeam) return res.status(404).json({ success: false, message: "Team not found" });

    if (!existingTeam.current) {
      return res.status(400).json({ success: false, message: "Timer not running for this team" });
    }

    const now = new Date();
    const elapsedThisSession = Math.floor((now - sessionStart) / 1000);
    existingTeam.timeTaken = Math.min((existingTeam.timeTaken || 0) + elapsedThisSession, 15 * 60);
    existingTeam.current = false;
    await existingTeam.save();

    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    sessionStart = null;
    activeTeam = null;

    const io = getIO();
    io.emit("timer_update", { team, time: existingTeam.timeTaken });

    console.log(`🛑 Timer stopped manually for team ${team}. Total time: ${existingTeam.timeTaken}s`);

    res.json({
      success: true,
      message: `Timer stopped for team ${team}`,
      totalTime: existingTeam.timeTaken,
    });
  } catch (err) {
    console.error("Stop error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


//=====================================================================================================================================

export const getTeams = async (req, res) => {
 try {
    const teams = await Team.find({}, { name: 1, _id: 0 }); // only get name field
    const teamNames = teams.map((team) => team.name); // array of names
    res.status(200).json(teamNames);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}
