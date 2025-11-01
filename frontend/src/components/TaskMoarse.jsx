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
    <div className="flex flex-col items-center gap-8 p-10 bg-gray-50 rounded-3xl">
      {/* Code Display */}
      <div className="flex gap-6">
        {digits.map((digit, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-2xl shadow-lg border-4 transition-all duration-300 ${
              isCorrect
                ? "border-emerald-500 text-emerald-600 bg-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "border-red-500 text-red-600 bg-red-50 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            }`}
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Status Text */}
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

export default TaskMoarse;