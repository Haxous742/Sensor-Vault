import React, { useState, useEffect } from "react";
import { PlayWrong } from "./playWrong"; // Add import to match other tasks

const TaskMagnetic = ({ socket, onTaskComplete }) => {
  // 3x3 = 9 elements, 1/-1 = dot, 0 = no dot
  const [gridValues, setGridValues] = useState([1, 0, -1, 0, 1, 0, -1, 1, 0]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetch("/api/task3/current")
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 Fetched current grid:", data);
        setGridValues(data.grid || []);
        setIsCorrect(data.isDone || false); // Also set initial correctness
      })
      .catch((err) => {
        console.error("❌ Error fetching magnetic grid:", err);
      });
  }, []);

  // Socket Listener (added to match pattern from other tasks)
  useEffect(() => {
    if (!socket) return;
    console.log("Setting up socket listener for task3Update");

    socket.on("task3Update", (data) => {
      console.log("📩 Live update from server:", data);
      setGridValues(data.grid || []);
      setIsCorrect(data.isDone);
      if (data.isDone) {
        // Call the parent's handleDone(3) to replicate exact behavior: API call, state update, confetti, next tasks
        onTaskComplete(3);
      } else {
        PlayWrong();
      }
    });

    // Cleanup
    return () => socket.off("task3Update");
  }, [socket, onTaskComplete]);

  // Trigger animation when correctness changes
  useEffect(() => {
    setJustChanged(true);
    const timer = setTimeout(() => setJustChanged(false), 600);
    return () => clearTimeout(timer);
  }, [isCorrect]);

  // Remove demo interval for production (uncomment if needed for testing)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setIsCorrect(prev => !prev);
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  const activeColor = isCorrect
    ? "bg-gradient-to-br from-emerald-400 to-emerald-500"
    : "bg-gradient-to-br from-rose-400 to-rose-500";

  const glowColor = isCorrect
    ? "shadow-[0_0_20px_rgba(16,185,129,0.4)]"
    : "shadow-[0_0_20px_rgba(244,63,94,0.4)]";

  return (
    <div className="flex flex-col items-center align-middle mx-auto gap-8 p-10 bg-white rounded-3xl shadow-xl max-w-md">
      {/* Header with animated icon */}
      <div className="text-center space-y-2">
        <div
          className={`text-5xl transition-all duration-500 ${
            justChanged ? "scale-125 rotate-12" : "scale-100 rotate-0"
          }`}
        >
          {/* Add icon here if needed, e.g., 🧲 or SVG */}
        </div>
        
      </div>

      {/* Grid display */}
      <div
        className={`grid grid-cols-3 gap-4 bg-gray-50 p-6 rounded-2xl transition-all duration-500 ${
          justChanged ? "scale-105" : "scale-100"
        }`}
      >
        {gridValues.map((val, index) => (
          <div
            key={index}
            className={`relative w-20 h-20 rounded-full transition-all duration-500 ${
              val !== 0
                ? `${activeColor} ${glowColor} scale-100`
                : "bg-gray-200 scale-90"
            }`}
            style={{
              transitionDelay: `${index * 50}ms`,
              animation: val !== 0 && justChanged ? `pulse-${isCorrect ? 'correct' : 'incorrect'} 0.6s ease-out` : 'none'
            }}
          >
            {/* Inner glow effect */}
            {val !== 0 && (
              <div
                className={`absolute inset-2 rounded-full ${
                  isCorrect ? "bg-emerald-200/50" : "bg-rose-200/50"
                } blur-sm`}
              ></div>
            )}
            
            {/* Polarity indicator */}
            {val !== 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold drop-shadow">
                {val === 1 ? "N" : "S"} {/* Example: Add N/S or +/− for polarity */}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-3">
        <div
          className={`transition-all duration-500 ${
            justChanged ? "scale-125 rotate-180" : "scale-100 rotate-0"
          }`}
        >
          {isCorrect ? (
            <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <p
          className={`text-xl font-semibold transition-all duration-500 ${
            isCorrect ? "text-emerald-600" : "text-rose-600"
          } ${justChanged ? "tracking-wide" : "tracking-normal"}`}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </p>
      </div>

      <style>{`
        @keyframes pulse-correct {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse-incorrect {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-5deg); }
          75% { transform: scale(1.05) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default TaskMagnetic;