import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import EditTaskModal from "../components/EditTaskModal.jsx";

const socket = io("/", { withCredentials: true });

const Dashboard = () => {
  const [timer, setTimer] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [editTask, setEditTask] = useState(null);

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/getTeams");
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // Listen for backend time updates
  useEffect(() => {
    socket.on("timer_update", (data) => setTimer(data.time));
    return () => socket.off("timer_update");
  }, []);

  const handleStart = async () => {
    if (!selectedTeam) return;
    try {
      await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const handleStop = async () => {
    if (!selectedTeam) return;
    try {
      await fetch("/api/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Handle input and suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedTeam(value);

    if (value.trim() === "") {
      setShowSuggestions(false);
      setFilteredTeams([]);
      return;
    }

    const filtered = teams.filter((team) =>
      team.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTeams(filtered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (team) => {
    setSelectedTeam(team);
    setShowSuggestions(false);
  };

  const handleDone = async (taskNumber) => {
    if (!selectedTeam) return;
    try {
      await fetch(`/api/task${taskNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });
    } catch (error) {
      console.error(`Failed to mark task${taskNumber} as done:`, error);
    }
  };

  const isValidTeam = selectedTeam.trim() !== "";

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="text-7xl font-mono font-bold mt-8 mb-4">
        {formatTime(timer)}
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleStart}
          disabled={!isValidTeam}
          className={`px-6 py-2 rounded-lg shadow transition-all transform active:scale-95 ${
            isValidTeam
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Start
        </button>

        <button
          onClick={handleStop}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow active:scale-95 transition-all transform"
        >
          Stop
        </button>
      </div>

      <div className="relative mb-10 w-64">
        <input
          type="text"
          value={selectedTeam}
          onChange={handleInputChange}
          placeholder="Enter or select a team..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
          onFocus={() => selectedTeam && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />

        {showSuggestions && filteredTeams.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
            {filteredTeams.map((team, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(team)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {team}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {[1, 2, 3, 4].map((task) => (
          <div
            key={task}
            className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-4">Task {task}</h2>

            <div className="flex space-x-4">
              <button
                onClick={() => isValidTeam && setEditTask(task)}
                disabled={!isValidTeam}
                className={`px-5 py-2 rounded-lg text-white active:scale-95 transition-all transform ${
                  isValidTeam
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Edit
              </button>

              <button
                onClick={() => handleDone(task)}
                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-all transform"
              >
                Done!
              </button>
            </div>
          </div>
        ))}
      </div>

      {editTask && (
        <EditTaskModal
          taskNumber={editTask}
          team={selectedTeam}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
