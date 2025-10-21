import React, { useState } from "react";

const Dashboard = () => {
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const teams = ["Team Alpha", "Team Bravo", "Team Charlie", "Team Delta"];

  // Timer logic
  React.useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!running && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  // Helper to format 4-digit display
  const formatTime = (time) => {
    return String(time).padStart(4, "0");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800 p-8">
      {/* Timer Section */}
      <div className="text-7xl font-mono font-bold mt-8 mb-4">
        {formatTime(timer)}
      </div>

      {/* Start / Stop Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setRunning(true)}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow"
        >
          Start
        </button>
        <button
          onClick={() => setRunning(false)}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
        >
          Stop
        </button>
      </div>

      {/* Dropdown for Teams */}
      <div className="mb-10">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select a Team</option>
          {teams.map((team, index) => (
            <option key={index} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Task Sections */}
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
