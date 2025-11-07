import React, { useState, useEffect } from "react";
import { PlayWrong } from "./playWrong"; // Add import to match other tasks

const TaskMagnetic = ({ socket, onTaskComplete }) => {
  // 3x3 = 9 elements, 1/-1 = lit red dot (N/S pole), 0 = no dot (off/gray)
  const [gridValues, setGridValues] = useState([1, 0, -1, 0, 1, 0, -1, 1, 0]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetch("/api/task3/current")
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 Fetched current grid:", data);
        // Use data.current as the 9-element array [0, -1, 1, ...]
        const currentArray = Array.isArray(data.current) ? data.current : [];
        // Ensure it's 9 elements, pad with 0s if needed
        const paddedGrid = [...currentArray, ...Array(9 - currentArray.length).fill(0)].slice(0, 9);
        setGridValues(paddedGrid);
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
      // Use data.current as the 9-element array [0, -1, 1, ...]
      const currentArray = Array.isArray(data.current) ? data.current : [];
      // Ensure it's 9 elements, pad with 0s if needed
      const paddedGrid = [...currentArray, ...Array(9 - currentArray.length).fill(0)].slice(0, 9);
      setGridValues(paddedGrid);
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

  // Helper to get cell class based on value (lit for 1/-1, gray for 0)
  const getCellClass = (val) => {
    if (val === 0) {
      return "bg-gray-300 scale-90"; // Off/gray
    }
    // Halloween lit for poles (1 or -1), with glow
    return `bg-gradient-to-br from-orange-500 to-purple-700 shadow-[0_0_15px_rgba(255,117,24,0.6)] scale-100 relative overflow-hidden`;
  };

  // Helper for polarity text
  const getPolarity = (val) => (val === 1 ? "W" : val === -1 ? "C" : "");

  return (
    <div className="flex flex-col items-center align-middle mx-auto gap-8 p-10 bg-[#0f0a06] border border-orange-700/30 rounded-3xl shadow-xl max-w-md animate-fadeSlideIn">
      {/* Header with animated icon */}
      <div className="text-center space-y-2">
        <div className="text-5xl">🧲</div> {/* Magnet icon */}
        <h3 className="text-lg font-extrabold text-orange-200 tracking-wide">Magnetic Field Grid</h3>
      </div>

      {/* 3x3 Grid display */}
      <div
        className={`grid grid-cols-3 gap-3 bg-gradient-to-br from-[#17110b] to-[#1f160f] p-6 rounded-2xl transition-all duration-500 border-2 border-orange-700/30 ${
          justChanged ? "scale-105 shadow-2xl" : "shadow-lg"
        }`}
      >
        {gridValues.map((val, index) => (
          <div
            key={index}
            className={`relative w-16 h-16 rounded-full transition-all duration-500 cursor-default flex items-center justify-center ${
              getCellClass(val)
            }`}
            style={{
              transitionDelay: `${(index % 3) * 50 + Math.floor(index / 3) * 150}ms`, // Staggered row-by-row
              animation: justChanged 
                ? `pulse-${isCorrect ? 'correct' : 'incorrect'} 0.6s ease-out forwards` 
                : 'none'
            }}
          >
            {/* Inner glow effect for lit cells */}
            {val !== 0 && (
              <div
                className={`absolute inset-1 rounded-full ${
                  isCorrect ? "bg-emerald-200/20" : "bg-orange-200/10"
                } blur-sm animate-ping`}
              ></div>
            )}
            
            {/* Polarity indicator for lit cells */}
            {val !== 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold drop-shadow-lg z-10">
                {getPolarity(val)}
              </div>
            )}

            {/* Overlay for overall correctness (green tint on correct) */}
            {isCorrect && val !== 0 && (
              <div className="absolute inset-0 bg-emerald-400/15 rounded-full animate-pulse"></div>
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
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <p
          className={`text-xl font-extrabold transition-all duration-500 ${
            isCorrect ? "text-emerald-300" : "text-orange-300"
          } ${justChanged ? "tracking-wide scale-110" : "tracking-normal"}`}
        >
          {isCorrect ? "Correct Configuration" : "Incorrect Configuration"}
        </p>
      </div>

      <style>{`
        @keyframes pulse-correct {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes pulse-incorrect {
          0%, 100% { transform: scale(1) rotate(0deg); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          25% { transform: scale(1.05) rotate(-5deg); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
          75% { transform: scale(1.05) rotate(5deg); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default TaskMagnetic;