import React, { useState } from "react";

const TaskMoarse = () => {
  // State for the 3-digit code
  const [digits, setDigits] = useState([1, 2, 5]);

  // Overall correctness flag (controls color)
  const [isCorrect, setIsCorrect] = useState(true);

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

      {/* Toggle for demo/testing */}
    
    </div>
  );
};

export default TaskMoarse;
