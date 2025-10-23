import React, { useState } from "react";
import { useEffect } from "react";

const TaskArrows = ({socket}) => {
  // Current 4 directions (display only)
  const [currentDirections,setCurrentDirections] = useState(["NE", "NE", "SE", "SW"]);

  // Overall correctness flag
  const [isCorrect, setIsCorrect] = useState(false);


  useEffect(() => {

    fetch("/api/task1/current")
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 Fetched current directions:", data);
        const directions = data.current.match(/.{1,2}/g); // Split into chunks of 2
        setCurrentDirections(directions);
        setIsCorrect(data.isDone);
      })
      .catch((err) => {
        console.error("❌ Error fetching current directions:", err);
      });
  }, []);


  useEffect(() => {
    if (!socket) return;

    socket.on("task1Update", (data) => {
      console.log("📩 Message from server:", data);
        setIsCorrect(data.isDone);
        
        const directions = data.current.match(/.{1,2}/g); // Split into chunks of 2
        setCurrentDirections(directions);
    });

    // Cleanup listener on unmount to avoid duplication
    return () => socket.off("task1Update");
  }, [socket]);



  // 8x8 binary patterns for directions
  const arrowPatterns = {
    NE: [
      "00000111",
      "00000011",
      "00000101",
      "00001000",
      "00010000",
      "00100000",
      "01000000",
      "10000000",
    ],
    NW: [
      "11100000",
      "11000000",
      "10100000",
      "00010000",
      "00001000",
      "00000100",
      "00000010",
      "00000001",
    ],
    SE: [
      "10000000",
      "01000000",
      "00100000",
      "00010000",
      "00001000",
      "00000101",
      "00000011",
      "00000111",
    ],
    SW: [
      "00000001",
      "00000010",
      "00000100",
      "00001000",
      "00010000",
      "10100000",
      "11000000",
      "11100000",
    ],
  };

  const getPattern = (dir) => arrowPatterns[dir] || arrowPatterns.NE;

  // LED color based on correctness
  const colorClass = isCorrect
    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]";

  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-gray-50 rounded-3xl">
      {/* Arrow Grid Section */}
      <div className="flex flex-wrap justify-center items-center gap-10">
        {currentDirections.map((dir, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <div className="grid grid-cols-8 gap-[3px] p-2 rounded-xl shadow-xl bg-gray-200">
              {getPattern(dir).map((row, rowIndex) =>
                row.split("").map((bit, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-3 h-3 rounded-full transition-all ${
                      bit === "1" ? colorClass : "bg-gray-300"
                    }`}
                  ></div>
                ))
              )}
            </div>
            <p
              className={`text-sm font-semibold transition-colors ${
                isCorrect ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {dir}
            </p>
          </div>
        ))}
      </div>

      {/* Correctness Display */}
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

export default TaskArrows;
