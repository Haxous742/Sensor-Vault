import React, { useState, useEffect } from "react";
import { PlayWrong } from "./playWrong";

const TaskMoarse = ({ socket, onTaskComplete }) => {
  const [digits, setDigits] = useState([1, 2, 5]);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    fetch("/api/task2/current")
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 Fetched Morse data:", data);
        const codeDigits = data.current.split("").map(Number);
        setDigits(codeDigits);
        setIsCorrect(data.isDone);
       
      })
      .catch((err) => {
        console.error("❌ Error fetching Morse data:", err);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;
    console.log("Setting up socket listener for task2Update");

    socket.on("task2Update", (data) => {
      console.log("📩 Live update from server:", data);
      const codeDigits = data.current.split("").map(Number);
      setDigits(codeDigits);
      setIsCorrect(data.isDone);
      if (data.isDone) {
        onTaskComplete(2);
      } else {
        PlayWrong();
      }
    });

    return () => socket.off("task2Update");
  }, [socket, onTaskComplete]);

  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-[#0f0a06] border border-orange-700/30 rounded-3xl shadow-xl animate-fadeSlideIn">
      {/* Code Display */}
      <div className="flex gap-6">
        {digits.map((digit, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-2xl shadow-lg border-4 transition-all duration-300 ${
              isCorrect
                ? "border-emerald-500 text-emerald-300 bg-[#0e1a14] shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "border-orange-600 text-orange-300 bg-[#1a120c] shadow-[0_0_20px_rgba(255,117,24,0.35)]"
            }`}
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Status Text */}
      <p
        className={`text-lg font-extrabold transition-colors ${
          isCorrect ? "text-emerald-300" : "text-orange-300"
        } tracking-wide`}
      >
        {isCorrect ? "✅ Correct" : "❌ Incorrect"}
      </p>
    </div>
  );
};

export default TaskMoarse;