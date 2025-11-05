import React, { useState, useEffect } from "react";
import { PlayWrong } from "./playWrong";

const TaskDistance = ({ socket, onTaskComplete }) => {
  const [distances, setDistances] = useState([0, 0, 0, 0]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  const parseDistances = (str) => {
    if (!str || str.length !== 8 || !/^\d{8}$/.test(str)) return [0, 0, 0, 0];
    const arr = [];
    for (let i = 0; i < 8; i += 2) {
      const val = parseInt(str.substring(i, i + 2), 10);
      arr.push(isNaN(val) ? 0 : Math.max(0, Math.min(30, val))); // Clamp 0–30
    }
    return arr;
  };

  useEffect(() => {
    fetch("/api/task4/current")
      .then((res) => res.json())
      .then((data) => {
        setDistances(parseDistances(data.current));
        setIsCorrect(data.isDone || false);
      })
      .catch((err) => console.error("Error fetching distance data:", err));
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("task4Update", (data) => {
      const parsed = parseDistances(data.current);
      setDistances(parsed);
      setIsCorrect(data.isDone);
      if (data.isDone) onTaskComplete(4);
      else PlayWrong();
    });

    return () => socket.off("task4Update");
  }, [socket, onTaskComplete]);

  // Brief scale animation when correctness changes
  useEffect(() => {
    setJustChanged(true);
    const timer = setTimeout(() => setJustChanged(false), 600);
    return () => clearTimeout(timer);
  }, [isCorrect]);

  const MAX = 30;

  return (
    <div className="flex flex-col items-center align-middle mx-auto gap-10 p-12 bg-[#0f0a06] border border-orange-700/30 rounded-3xl shadow-xl max-w-[800px] w-full animate-fadeSlideIn h-full">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-6xl">📏</div>
        <h3 className="text-2xl font-extrabold text-orange-200 tracking-wide">
          Ultrasonic Distance Sensors
        </h3>
      </div>

      {/* Distance Bars */}
      <div
        className={`flex flex-col justify-center w-full gap-6 bg-gradient-to-br from-[#17110b] to-[#1f160f] p-8 rounded-2xl transition-all duration-500 border-2 border-orange-700/30 ${
          justChanged ? "scale-105 shadow-2xl" : "shadow-lg"
        }`}
      >
        {distances.map((distance, i) => {
          const barWidth = Math.min((distance / MAX) * 100, 100);
          const color = isCorrect
            ? "bg-emerald-500"
            : distance > 15
            ? "bg-orange-500"
            : "bg-blue-500";

          return (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-base text-orange-300 font-semibold">
                <span>Sensor {i + 1}</span>
                <span>{distance}</span>
              </div>

              <div className="w-full bg-[#1a120c] border border-orange-700/30 rounded-md h-5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${color}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div
          className={`transition-all duration-500 ${
            justChanged ? "scale-125 rotate-180" : "scale-100 rotate-0"
          }`}
        >
          {isCorrect ? (
            <svg
              className="w-9 h-9 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-9 h-9 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <p
          className={`text-2xl font-extrabold transition-all duration-500 ${
            isCorrect ? "text-emerald-300" : "text-orange-300"
          } ${justChanged ? "tracking-wide scale-110" : "tracking-normal"}`}
        >
          {isCorrect ? "Correct Reading" : "Incorrect Reading"}
        </p>
      </div>
    </div>
  );
};

export default TaskDistance;
