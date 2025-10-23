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
        existingTeam.isDone = true;
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

//=====================================================================================================================================

export const task1 = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team) return res.status(400).json({ message: "Team name is required" });

    const existingTeam = await Team.findOne({ name: team });
    if (!existingTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    // Calculate time from start to now
    const now = new Date();
    const startTime = existingTeam.startedAt;
    if (!startTime) return res.status(400).json({ message: "Session not started" });

    const elapsedTime = Math.floor((now - startTime) / 1000); // seconds

    existingTeam.task1Done = true;
    existingTeam.task1timeTaken = elapsedTime;
    existingTeam.lastTaskEndTime = now; // mark end time for next interval
    existingTeam.task1CurrentAnswer = existingTeam.task1CorrectAnswer;
    await existingTeam.save();

    res.status(200).json({
      message: "Task 1 marked as done",
      timeTaken: elapsedTime,
    });
  } catch (error) {
    console.error("Error updating task1:", error);
    res.status(500).json({ message: "Server error updating task 1" });
  }
};

export const task2 = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team) return res.status(400).json({ message: "Team name is required" });

    const existingTeam = await Team.findOne({ name: team });
    if (!existingTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    // REMOVED: Task 1 requirement check

    const now = new Date();
    // Use the later of task1EndTime or startedAt as the base
    const lastEnd = existingTeam.lastTaskEndTime || existingTeam.startedAt;
    const elapsedTime = Math.floor((now - lastEnd) / 1000);

    existingTeam.task2Done = true;
    existingTeam.task2timeTaken = elapsedTime;
    existingTeam.lastTaskEndTime = now;
    existingTeam.task2CurrentAnswer = existingTeam.task2CorrectAnswer;
    await existingTeam.save();

    res.status(200).json({
      message: "Task 2 marked as done",
      timeTaken: elapsedTime,
    });
  } catch (error) {
    console.error("Error updating task2:", error);
    res.status(500).json({ message: "Server error updating task 2" });
  }
};

export const task3 = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team) return res.status(400).json({ message: "Team name is required" });

    const existingTeam = await Team.findOne({ name: team });
    if (!existingTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    // Require BOTH task1 and task2
    if (!existingTeam.task1Done || !existingTeam.task2Done)
      return res.status(400).json({ message: "Tasks 1 and 2 must be completed first" });

    const now = new Date();
    const lastEnd = existingTeam.lastTaskEndTime || existingTeam.startedAt;
    const elapsedTime = Math.floor((now - lastEnd) / 1000);

    existingTeam.task3Done = true;
    existingTeam.task3timeTaken = elapsedTime;
    existingTeam.lastTaskEndTime = now;
    existingTeam.task3CurrentAnswer = existingTeam.task3CorrectAnswer;
    await existingTeam.save();

    res.status(200).json({
      message: "Task 3 marked as done",
      timeTaken: elapsedTime,
    });
  } catch (error) {
    console.error("Error updating task3:", error);
    res.status(500).json({ message: "Server error updating task 3" });
  }
};

export const task4 = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team) return res.status(400).json({ message: "Team name is required" });

    const existingTeam = await Team.findOne({ name: team });
    if (!existingTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    if (!existingTeam.task3Done)
      return res.status(400).json({ message: "Task 3 must be completed first" });

    const now = new Date();
    const lastEnd = existingTeam.lastTaskEndTime || existingTeam.startedAt;
    const elapsedTime = Math.floor((now - lastEnd) / 1000);

    // ✅ Calculate total time from session
    const sessionElapsed = sessionStart ? Math.floor((now - sessionStart) / 1000) : 0;
    const totalTime = (existingTeam.timeTaken || 0) + sessionElapsed;

    existingTeam.task4Done = true;
    existingTeam.task4timeTaken = elapsedTime;
    existingTeam.lastTaskEndTime = now;
    existingTeam.task4CurrentAnswer = existingTeam.task4CorrectAnswer;
    existingTeam.isDone = true;
    existingTeam.result = true;
    existingTeam.current = false;
    existingTeam.timeTaken = totalTime;  // ✅ Save final time
    await existingTeam.save();

    // Clear the timer interval
    if (interval && activeTeam === team) {
      clearInterval(interval);
      interval = null;
      activeTeam = null;
      sessionStart = null;
    }

    const io = getIO();
    io.emit("timer_update", { team, time: totalTime });  // ✅ Emit final time

    res.status(200).json({
      success: true,  // ✅ Add success flag
      message: "Task 4 marked as done - Game completed!",
      timeTaken: elapsedTime,
      totalTime: totalTime,  // ✅ Return total time
    });
  } catch (error) {
    console.error("Error updating task4:", error);
    res.status(500).json({ message: "Server error updating task 4" });
  }
};

//=====================================================================================================================================

export const task1edit = async (req, res) => {
  try {
    const { team, text } = req.body;

    if (!team || !text)
      return res.status(400).json({ message: "Missing team name or text input" });

    const foundTeam = await Team.findOne({ name: team });
    if (!foundTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    foundTeam.task1CorrectAnswer = text;
    await foundTeam.save();

    res.status(200).json({ message: "Task 1 answer updated successfully" });
  } catch (error) {
    console.error("Error updating task1:", error);
    res.status(500).json({ message: "Server error updating task 1" });
  }
};

export const task2edit = async (req, res) => {
  try {
    const { team, text } = req.body;

    if (!team || !text)
      return res.status(400).json({ message: "Missing team name or text input" });

    const foundTeam = await Team.findOne({ name: team });
    if (!foundTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    foundTeam.task2CorrectAnswer = text;
    await foundTeam.save();

    res.status(200).json({ message: "Task 2 answer updated successfully" });
  } catch (error) {
    console.error("Error updating task2:", error);
    res.status(500).json({ message: "Server error updating task 2" });
  }
};

export const task3edit = async (req, res) => {
  try {
    const { team, text } = req.body;

    if (!team || !text)
      return res.status(400).json({ message: "Missing team name or text input" });

    const foundTeam = await Team.findOne({ name: team });
    if (!foundTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    foundTeam.task3CorrectAnswer = text;
    await foundTeam.save();

    res.status(200).json({ message: "Task 3 answer updated successfully" });
  } catch (error) {
    console.error("Error updating task3:", error);
    res.status(500).json({ message: "Server error updating task 3" });
  }
};

export const task4edit = async (req, res) => {
  try {
    const { team, text } = req.body;

    if (!team || !text)
      return res.status(400).json({ message: "Missing team name or text input" });

    const foundTeam = await Team.findOne({ name: team });
    if (!foundTeam)
      return res.status(404).json({ message: `Team '${team}' not found` });

    foundTeam.task4CorrectAnswer = text;
    await foundTeam.save();

    res.status(200).json({ message: "Task 4 answer updated successfully" });
  } catch (error) {
    console.error("Error updating task4:", error);
    res.status(500).json({ message: "Server error updating task 4" });
  }
};

//=====================================================================================================================================

export const teamProgress = async (req, res) => {
  try {
    const { team } = req.query;
    if (!team) return res.status(400).json({ message: "Team name required" });

    const foundTeam = await Team.findOne({ name: team });
    if (!foundTeam) return res.status(404).json({ message: "Team not found" });

    res.json({
      task1Done: foundTeam.task1Done,
      task2Done: foundTeam.task2Done,
      task3Done: foundTeam.task3Done,
      task4Done: foundTeam.task4Done,
      isDone: foundTeam.isDone,        // ✅ Add this
      timeTaken: foundTeam.timeTaken,  // ✅ Add this
    });
  } catch (err) {
    console.error("Error fetching team progress:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//=====================================================================================================================================

export const leaderboard = async (req, res) => {
  try {
    // Fetch all teams from the database
    const teams = await Team.find({}).sort({ timeTaken: 1 }); // Sort by time taken (ascending)

    // Transform data to match frontend expectations
    const leaderboardData = teams.map(team => {
      // Count how many tasks are completed
      const tasksCompleted = [
        team.task1Done,
        team.task2Done,
        team.task3Done,
        team.task4Done
      ].filter(Boolean).length;

      return {
        name: team.name,
        tasksCompleted: tasksCompleted,
        taskTimes: [
          team.task1timeTaken || 0,
          team.task2timeTaken || 0,
          team.task3timeTaken || 0,
          team.task4timeTaken || 0
        ],
        overallTime: team.timeTaken || 0,
        isDone: team.isDone,
        current: team.current // To identify which team is currently playing
      };
    });

    // Sort leaderboard:
    // 1. Teams with more tasks completed come first
    // 2. If tasks are equal, lower time comes first
    // 3. Teams with 0 tasks go to the bottom
    leaderboardData.sort((a, b) => {
      // Teams with 0 tasks go to bottom
      if (a.tasksCompleted === 0 && b.tasksCompleted === 0) {
        return 0; // Keep original order for teams with 0 tasks
      }
      if (a.tasksCompleted === 0) return 1;
      if (b.tasksCompleted === 0) return -1;

      // First priority: more tasks completed
      if (b.tasksCompleted !== a.tasksCompleted) {
        return b.tasksCompleted - a.tasksCompleted;
      }

      // Second priority: lower time (for teams with same task count)
      return a.overallTime - b.overallTime;
    });

    res.status(200).json({
      success: true,
      leaderboard: leaderboardData,
      currentTeam: leaderboardData.find(team => team.current) || null
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch leaderboard",
      error: error.message 
    });
  }
};

//=====================================================================================================================================




export const task1Current = async (req, res) => {
  try {
    const team = await Team.findOne({current:true});

    if(!team ){
      return res.status(404).json({message:"No team found with current task active"});
    }

    return res.status(200).json({current:team.task1CurrentAnswer, isDone:team.task1Done});
  } catch (error) {
    console.error("Error fetching task1 current answer:", error);
    res.status(500).json({ message: "Server error fetching task1 current answer" });
  }
};

export const task2Current = async (req, res) => {
  try {
    const team = await Team.findOne({current:true});

    if(!team ){
      return res.status(404).json({message:"No team found with current task active"});
    }

    console.log("Fetched task2 current answer:", team.task2CurrentAnswer);

    return res.status(200).json({current:team.task2CurrentAnswer, isDone:team.task2Done});
  } catch (error) {
    console.error("Error fetching task2 current answer:", error);
    res.status(500).json({ message: "Server error fetching task2 current answer" });
  }
};

export const task3Current = async (req, res) => {
  try {
    const team = await Team.findOne({current:true});      
    if(!team ){
      return res.status(404).json({message:"No team found with current task active"});
    }

    return res.status(200).json({current:team.task3CurrentAnswer, isDone:team.task3Done});
  } catch (error) {
    console.error("Error fetching task3 current answer:", error);
    res.status(500).json({ message: "Server error fetching task3 current answer" });
  }
};  

export const task4Current = async (req, res) => {
  try {
    const team = await Team.findOne({current:true});      
    if(!team ){
      return res.status(404).json({message:"No team found with current task active"});
    }

    return res.status(200).json({current:team.task4CurrentAnswer, isDone:team.task4Done});
  } catch (error) {
    console.error("Error fetching task4 current answer:", error);
    res.status(500).json({ message: "Server error fetching task4 current answer" });
  }
};