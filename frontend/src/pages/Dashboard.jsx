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
  const [taskStatus, setTaskStatus] = useState({
    task1Done: false,
    task2Done: false,
    task3Done: false,
    task4Done: false,
  });
  const [activeTeam, setActiveTeam] = useState(null); // 🔹 Track active timer team

  // Fetch teams on load
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

  // Listen for timer updates
  useEffect(() => {
    socket.on("timer_update", (data) => {
      setTimer(data.time);
      setActiveTeam(data.team); // 🔹 Identify which team's timer is active
      setSelectedTeam(data.team); // 🔹 Automatically fill input with that team
    });

    return () => socket.off("timer_update");
  }, []);

  // Fetch team progress when selected team changes
  useEffect(() => {
    if (!selectedTeam) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/teamProgress?team=${selectedTeam}`);
        if (!res.ok) return;
        const data = await res.json();
        setTaskStatus({
          task1Done: data.task1Done,
          task2Done: data.task2Done,
          task3Done: data.task3Done,
          task4Done: data.task4Done,
        });
      } catch (error) {
        console.error("Failed to fetch team progress:", error);
      }
    };

    fetchProgress();
  }, [selectedTeam]);

  // Start the timer
  const handleStart = async () => {
    if (!selectedTeam) return;
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });

      if (res.ok) {
        setActiveTeam(selectedTeam); // 🔹 Lock input after start
      }
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  // Stop the timer
  const handleStop = async () => {
    if (!selectedTeam) return;
    try {
      const res = await fetch("/api/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });

      if (res.ok) {
        setActiveTeam(null); // 🔹 Unlock input after stop
      }
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  const handleDone = async (taskNumber) => {
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/task${taskNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });

      if (res.ok) {
        setTaskStatus((prev) => ({
          ...prev,
          [`task${taskNumber}Done`]: true,
        }));
      }
    } catch (error) {
      console.error(`Failed to mark task${taskNumber} as done:`, error);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleInputChange = (e) => {
    if (activeTeam) return; // 🔹 Disable input when timer is active
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
    if (activeTeam) return; // 🔹 Prevent switching when active
    setSelectedTeam(team);
    setShowSuggestions(false);
  };

  const isValidTeam = selectedTeam.trim() !== "";
  const isTaskDisabled = (task) => {
    if (task === 1) return false;
    if (task === 2) return !taskStatus.task1Done;
    if (task === 3) return !taskStatus.task2Done;
    if (task === 4) return !taskStatus.task3Done;
    return true;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="text-7xl font-mono font-bold mt-8 mb-4">
        {formatTime(timer)}
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleStart}
          disabled={!isValidTeam || activeTeam} // 🔹 Can't start if no team OR already running
          className={`px-6 py-2 rounded-lg shadow transition-all transform active:scale-95 ${
            !isValidTeam || activeTeam
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          Start
        </button>

        <button
          onClick={handleStop}
          disabled={!activeTeam} // 🔹 Stop only when timer active
          className={`px-6 py-2 rounded-lg shadow transition-all transform active:scale-95 ${
            activeTeam
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
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
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 ${
            activeTeam
              ? "cursor-not-allowed bg-gray-100"
              : "focus:ring-blue-400"
          }`}
          disabled={!!activeTeam} // 🔹 Disable input when timer active
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
                disabled={isTaskDisabled(task) || taskStatus[`task${task}Done`]}
                className={`px-5 py-2 rounded-lg text-white active:scale-95 transition-all transform ${
                  isTaskDisabled(task) || taskStatus[`task${task}Done`]
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {taskStatus[`task${task}Done`] ? "Done ✓" : "Done!"}
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
