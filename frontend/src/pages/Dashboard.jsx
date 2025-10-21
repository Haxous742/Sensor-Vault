import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Initialize socket with backend URL from environment variable
const socket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });

const Dashboard = () => {
  const [timer, setTimer] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState([]);

  // Fetch teams from backend
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/getTeams');
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // Listen for timer updates from backend
  useEffect(() => {
    socket.on("timer_update", (data) => {
      setTimer(data.time);
    });
    return () => {
      socket.off("timer_update");
    };
  }, []);

  const handleStart = async () => {
    await fetch('/api/start', {
      method: "POST",
      credentials: "include",
    });
  };

  const handleStop = async () => {
    await fetch('/api/stop', {
      method: "POST",
      credentials: "include",
    });
  };

  const formatTime = (time) => String(time).padStart(4, "0");

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="text-7xl font-mono font-bold mt-8 mb-4">
        {formatTime(timer)}
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleStart}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
        >
          Stop
        </button>
      </div>

      <div className="mb-10 w-64">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 h-36 overflow-y-auto"
          size={6} // shows 6 items at a time, scrollable if more
        >
          {teams.length === 0 && <option value="">No Teams Available</option>}
          {teams.map((team, index) => (
            <option key={index} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {[1, 2, 3, 4].map((task) => (
          <div
            key={task}
            className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-4">Task {task}</h2>
            <button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
