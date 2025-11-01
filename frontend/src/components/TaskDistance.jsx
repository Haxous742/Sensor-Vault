import React, { useState, useEffect } from "react";
import { PlayWrong } from "./playWrong"; // Add import to match other tasks

const TaskDistance = ({ socket, onTaskComplete }) => {
  // State for 4 distances (pairs from 8-digit string)
  const [distances, setDistances] = useState([12, 34, 56, 78]); // Example initial values
  const [isCorrect, setIsCorrect] = useState(false);

  // Helper to parse 8-digit string into 4 distances
  const parseDistances = (currentString) => {
    if (!currentString || currentString.length !== 8 || !/^\d{8}$/.test(currentString)) {
      console.warn("Invalid current string:", currentString); // Debug log
      return [0, 0, 0, 0]; // Fallback to zeros
    }
    const parsed = [];
    for (let i = 0; i < 8; i += 2) {
      const pair = currentString.substring(i, i + 2);
      const num = parseInt(pair, 10);
      parsed.push(isNaN(num) ? 0 : Math.max(0, Math.min(99, num))); // Clamp 0-99 cm
    }
    console.log("Parsed distances:", parsed); // Debug log
    return parsed;
  };

  // Initial Fetch
  useEffect(() => {
    fetch("/api/task4/current")
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 Fetched distance data:", data);
        setDistances(parseDistances(data.current));
        setIsCorrect(data.isDone || false); // Also set initial correctness
      })
      .catch((err) => {
        console.error("❌ Error fetching distance data:", err);
      });
  }, []);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;
    console.log("Setting up socket listener for task4Update");

    socket.on("task4Update", (data) => {
      console.log("📩 Live update from server:", data);
      setDistances(parseDistances(data.current)); // Use helper with validation/logging
      setIsCorrect(data.isDone);
      if (data.isDone) {
        // Call the parent's handleDone(4) to replicate exact behavior: API call, state update, victory confetti, end game
        onTaskComplete(4);
      } else {
        PlayWrong();
      }
    });

    // Cleanup
    return () => socket.off("task4Update");
  }, [socket, onTaskComplete]);

  // Max distance for scaling (e.g., 100 cm)
  const MAX_DISTANCE = 100;

  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-gray-50 rounded-3xl">
      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Ultrasonic Sensors</h3>

      {/* 4 Sensor Visualizations */}
      <div className="space-y-6 w-full max-w-2xl">
        {distances.map((distance, index) => {
          const barWidth = Math.min((distance / MAX_DISTANCE) * 100, 100); // Percentage width
          const isFar = distance > 50; // Color based on distance (e.g., green if close, orange if far)
          const barColor = isCorrect ? 'bg-emerald-500' : (isFar ? 'bg-orange-500' : 'bg-blue-500');

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              {/* Sensor Icon */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📡</span> {/* Ultrasonic sensor emoji */}
                </div>
                <span className="text-sm font-medium text-gray-700">Sensor {index + 1}</span>
              </div>

              {/* Distance Bar */}
              <div className="w-full bg-gray-200 rounded-lg h-4 overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ease-in-out ${barColor} shadow-md`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>

              {/* Object Representation (positioned at end of bar) */}
              <div className="flex items-center justify-between w-full px-2">
                <span className="text-xs text-gray-500">0 cm</span>
                <div className={`text-lg transition-transform ${isCorrect ? 'scale-110 text-emerald-600' : 'text-gray-600'}`}>
                  🗿 {/* Object emoji - adjust as needed */}
                </div>
                <span className="text-xs text-gray-500">{MAX_DISTANCE} cm</span>
              </div>

              {/* Distance Value */}
              <p className={`text-lg font-semibold transition-colors ${
                isCorrect ? "text-emerald-600" : "text-red-600"
              }`}>
                {distance} cm
              </p>
            </div>
          );
        })}
      </div>

      {/* Overall Status Text */}
      <p
        className={`text-lg font-semibold transition-colors ${
          isCorrect ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {isCorrect ? "✅ Correct" : "❌ Incorrect"}
      </p>
    </div>
  );
};

export default TaskDistance;