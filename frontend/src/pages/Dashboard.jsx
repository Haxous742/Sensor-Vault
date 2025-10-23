import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import TaskArrows from "../components/TaskArrows.jsx";
import TaskMoarse from "../components/TaskMoarse.jsx";

const socket = io("/", { withCredentials: true });

// Mock EditTaskModal component
const EditTaskModal = ({ taskNumber, team, onClose }) => {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    try {
      await fetch(`/api/task${taskNumber}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team, text }),
      });
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 transform transition-all">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Task {taskNumber}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 focus:border-blue-500 focus:outline-none transition-colors resize-none"
          rows="5"
          placeholder="Enter task details..."
        />
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [timer, setTimer] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    return localStorage.getItem("selectedTeam") || "";
  });
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
  const [activeTeam, setActiveTeam] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(true);
  const [currentTasks, setCurrentTasks] = useState([1]);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [isTeamCompleted, setIsTeamCompleted] = useState(false);
  const confettiTimeoutRef = useRef(null);

  // Save selected team to localStorage whenever it changes
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem("selectedTeam", selectedTeam);
    } else {
      localStorage.removeItem("selectedTeam");
    }
  }, [selectedTeam]);

  const getNextTaskFromStatus = (status) => {
    if (!status) return [1, 2];

    // First phase: show 1 and 2 together until both done
    if (!status.task1Done || !status.task2Done) return [1, 2];

    // Then task 3
    if (!status.task3Done) return [3];

    // Then task 4
    if (!status.task4Done) return [4];

    // all done
    return null;
  };

  const runConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

    } catch (err) {
      console.warn("Confetti import failed or not installed:", err.message);
    }
  };

  const runVictoryConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 120, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 100 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
        });
      }, 150);

    } catch (err) {
      console.warn("Confetti import failed or not installed:", err.message);
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/getTeams");
        const data = await res.json();
        setTeams(data || []);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    socket.on("timer_update", (data) => {
      setTimer(data.time);
      setActiveTeam(data.team);

      // Check if timer reached 15 minutes (900 seconds)
      if (data.time >= 900) {
        // Check if all tasks are done
        if (taskStatus.task1Done && taskStatus.task2Done && taskStatus.task3Done && taskStatus.task4Done) {
          setGameSuccess(true);
        } else {
          setGameSuccess(false);
        }
        setGameComplete(true);
        setActiveTeam(null);
        setIsTeamCompleted(true);
        return;
      }

      if (data.team && selectedTeam && data.team === selectedTeam) {
        const next = getNextTaskFromStatus(taskStatus);
        if (next) {
          setShowAllTasks(false);
          setCurrentTasks(Array.isArray(next) ? next : [next]);
        } else {
          setShowAllTasks(true);
        }
      } else {
        setShowAllTasks(true);
      }
    });

    return () => {
      socket.off("timer_update");
    };
  }, [selectedTeam, taskStatus]);

  useEffect(() => {
    if (!selectedTeam) {
      setShowAllTasks(true);
      setTaskStatus({
        task1Done: false,
        task2Done: false,
        task3Done: false,
        task4Done: false,
      });
      setIsTeamCompleted(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/teamProgress?team=${encodeURIComponent(selectedTeam)}`);
        if (!res.ok) return;
        const data = await res.json();
        const newStatus = {
          task1Done: !!data.task1Done,
          task2Done: !!data.task2Done,
          task3Done: !!data.task3Done,
          task4Done: !!data.task4Done,
        };
        setTaskStatus(newStatus);

        // Check if team is completed (isDone = true)
        if (data.isDone) {
          setIsTeamCompleted(true);
          setTimer(data.timeTaken || 0);
          setShowAllTasks(true);
        } else {
          setIsTeamCompleted(false);
          
          if (activeTeam && activeTeam === selectedTeam) {
            const next = getNextTaskFromStatus(newStatus);
            if (next) {
              setShowAllTasks(false);
              setCurrentTasks(Array.isArray(next) ? next : [next]);
            } else {
              setShowAllTasks(true);
            }
          } else {
            setShowAllTasks(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch team progress:", error);
      }
    };

    fetchProgress();
  }, [selectedTeam, activeTeam]);

  // Stop clock when team box is empty
  useEffect(() => {
    if (!selectedTeam.trim() && activeTeam) {
      handleStop();
    }
  }, [selectedTeam]);

  const handleStart = async () => {
    if (!selectedTeam.trim() || isTeamCompleted) return;
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team: selectedTeam }),
      });

      if (res.ok) {
        const next = getNextTaskFromStatus(taskStatus);
        setCurrentTasks(Array.isArray(next) ? next : [next]);
        setShowAllTasks(false);
        setActiveTeam(selectedTeam);
        setGameComplete(false);
      }
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

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
        setActiveTeam(null);
        setShowAllTasks(true);
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
        const responseData = await res.json();
        
        setTaskStatus((prev) => {
          const updated = { ...prev, [`task${taskNumber}Done`]: true };
          
          // Check if this was task 4 (last task)
          if (taskNumber === 4) {
            // Show victory screen
            setGameSuccess(true);
            setGameComplete(true);
            setIsTeamCompleted(true);
            setTimer(responseData.totalTime || timer);
            runVictoryConfetti();
            return updated;
          }
          
          return updated;
        });

        runConfetti();

        if (taskNumber !== 4) {
          if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
          confettiTimeoutRef.current = setTimeout(() => {
            setTaskStatus((prev) => {
              const next = getNextTaskFromStatus(prev);
              if (next) {
                setCurrentTasks(Array.isArray(next) ? next : [next]);
                setShowAllTasks(false);
              } else {
                setShowAllTasks(true);
              }
              return prev;
            });
          }, 1000);
        }
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
    // Only block input if timer is actively running for this team AND team is not completed
    if (activeTeam && activeTeam === selectedTeam && !isTeamCompleted) return;
    
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
    // Only block selection if timer is actively running for this team AND team is not completed
    if (activeTeam && activeTeam === selectedTeam && !isTeamCompleted) return;
    
    setSelectedTeam(team);
    setShowSuggestions(false);
  };

  const handleBackToDashboard = () => {
    setGameComplete(false);
    setShowAllTasks(true);
    // Reset task status when going back after completion
    setTaskStatus({
      task1Done: false,
      task2Done: false,
      task3Done: false,
      task4Done: false,
    });
  };

  const isValidTeam = selectedTeam.trim() !== "";
  
  const isTaskDisabled = (task) => {
    // Tasks 1 and 2 can be done in any order
    if (task === 1 || task === 2) return false;
    // Task 3 requires both 1 and 2 to be done
    if (task === 3) return !taskStatus.task1Done || !taskStatus.task2Done;
    // Task 4 requires task 3 to be done
    if (task === 4) return !taskStatus.task3Done;
    return true;
  };

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    };
  }, []);

  // Game Complete Screen
  if (gameComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-gray-800 p-8">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-2xl transform transition-all">
          {gameSuccess ? (
            <>
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Congratulations!
              </h1>
              <p className="text-2xl text-gray-700 mb-6">
                Team <span className="font-bold text-blue-600">{selectedTeam}</span> completed all tasks!
              </p>
              <div className="text-6xl font-mono font-bold mb-8 text-gray-800">
                {formatTime(timer)}
              </div>
              <p className="text-lg text-gray-600 mb-8">
                Amazing job! You've successfully completed all challenges.
              </p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">⏰</div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Time's Up!
              </h1>
              <p className="text-2xl text-gray-700 mb-6">
                Better luck next time, <span className="font-bold text-blue-600">{selectedTeam}</span>!
              </p>
              <div className="text-6xl font-mono font-bold mb-8 text-gray-800">
                15:00
              </div>
              <p className="text-lg text-gray-600 mb-8">
                You ran out of time, but great effort! Try again to beat the clock.
              </p>
            </>
          )}
          <button
            onClick={handleBackToDashboard}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-semibold text-xl transform hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-gray-800 p-8">
      <div className="text-8xl font-mono font-bold mt-12 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        {formatTime(timer)}
      </div>

      <div className="container flex flex-row items-center justify-center max-w-5xl w-full flex-wrap gap-12 align-middle">
      <div className="flex space-x-4 mb-10">
        <button
          onClick={handleStart}
          disabled={!isValidTeam || !!activeTeam || isTeamCompleted}
          className={`px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-semibold text-lg ${
            !isValidTeam || !!activeTeam || isTeamCompleted
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-500/50"
          }`}
        >
          Start
        </button>

        <button
          onClick={handleStop}
          disabled={!activeTeam || isTeamCompleted}
          className={`px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-semibold text-lg ${
            activeTeam && !isTeamCompleted
              ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-red-500/50"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Stop
        </button>
      </div>

      <div className="relative mb-12 w-80">
        <input
          type="text"
          value={selectedTeam}
          onChange={handleInputChange}
          placeholder="Enter or select a team..."
          className={`w-full px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:ring-4 text-lg font-medium transition-all ${
            activeTeam && activeTeam === selectedTeam && !isTeamCompleted
              ? "cursor-not-allowed bg-gray-100 border-gray-300"
              : "focus:ring-blue-300 focus:border-blue-500 hover:border-blue-400"
          }`}
          disabled={activeTeam && activeTeam === selectedTeam && !isTeamCompleted}
          onFocus={() => selectedTeam && !(activeTeam && activeTeam === selectedTeam && !isTeamCompleted) && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />

        {showSuggestions && filteredTeams.length > 0 && (
          <ul className="absolute z-10 w-full mt-2 max-h-48 overflow-y-auto bg-white border-2 border-gray-200 rounded-2xl shadow-2xl">
            {filteredTeams.map((team, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(team)}
                className="px-6 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all font-medium first:rounded-t-2xl last:rounded-b-2xl"
              >
                {team}
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>

      {showAllTasks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {[1, 2, 3, 4].map((task) => (
            <div
              key={task}
              className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center border-2 border-gray-100 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Task {task}
              </h2>

              <div className="flex space-x-4">
                <button
                  onClick={() => isValidTeam && !isTeamCompleted && setEditTask(task)}
                  disabled={!isValidTeam || isTeamCompleted}
                  className={`px-6 py-3 rounded-xl text-white active:scale-95 transition-all transform font-semibold shadow-lg ${
                    isValidTeam && !isTeamCompleted
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDone(task)}
                  disabled={isTaskDisabled(task) || taskStatus[`task${task}Done`] || isTeamCompleted}
                  className={`px-6 py-3 rounded-xl text-white active:scale-95 transition-all transform font-semibold shadow-lg ${
                    isTaskDisabled(task) || taskStatus[`task${task}Done`] || isTeamCompleted
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  }`}
                >
                  {taskStatus[`task${task}Done`] ? "Done ✓" : "Done!"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // <div className={`flex justify-center w-full `}>
        //   <div className={`grid ${currentTasks.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-5 w-full`}>
        //     {currentTasks.map((task) => (
        //       <div
        //         key={task}
        //         className="bg-white py-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-100 transform transition-all"
        //       >
        //         <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        //           Task {task}
        //         </h2>
        //         {task === 1? (<TaskArrows />): null}

        //         {task === 2? (null): null}

        //         {task === 3? (null): null}

        //         {task === 4? (null): null}

        //         <div className="flex space-x-4 mt-5">
        //           <button
        //             onClick={() => isValidTeam && setEditTask(task)}
        //             disabled={!isValidTeam}
        //             className={`px-6 py-1 rounded-lg text-white active:scale-95 transition-all transform font-semibold text-sm shadow-lg ${
        //               isValidTeam
        //                 ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        //                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
        //             }`}
        //           >
        //             Edit
        //           </button>

        //           <button
        //             onClick={() => handleDone(task)}
        //             disabled={isTaskDisabled(task) || taskStatus[`task${task}Done`]}
        //             className={`px-8 py-3 rounded-xl text-white active:scale-95 transition-all transform font-semibold text-lg shadow-lg ${
        //               isTaskDisabled(task) || taskStatus[`task${task}Done`]
        //                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        //                 : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        //             }`}
        //           >
        //             {taskStatus[`task${task}Done`] ? "Done ✓" : "Done!"}
        //           </button>
        //         </div>
        //       </div>
        //     ))}
        //   </div>
        // </div>
        <div className="flex justify-center w-full">
  <div className={`grid ${currentTasks.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 w-full`}>
    {currentTasks.map((task) => (
      <div
        key={task}
        className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task {task}
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => isValidTeam && setEditTask(task)}
              disabled={!isValidTeam}
              className={`group p-2.5 rounded-xl transition-all duration-300 ${
                isValidTeam
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              title="Edit"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={() => handleDone(task)}
              disabled={isTaskDisabled(task) || taskStatus[`task${task}Done`]}
              className={`group p-2.5 rounded-xl transition-all duration-300 ${
                isTaskDisabled(task) || taskStatus[`task${task}Done`]
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg active:scale-95"
              }`}
              title={taskStatus[`task${task}Done`] ? "Done" : "Mark as done"}
            >
              <svg className={`w-4 h-4 transition-all ${!isTaskDisabled(task) && !taskStatus[`task${task}Done`] && 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="">
          {task === 1 ? (<TaskArrows socket={socket}/>) : null}
          {task === 2 ? (<TaskMoarse />) : null}
          {task === 3 ? (null) : null}
          {task === 4 ? (null) : null}
        </div>
      </div>
    ))}
  </div>
</div>
      )}

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