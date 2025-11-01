import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import TaskArrows from "../components/TaskArrows.jsx";
import TaskMoarse from "../components/TaskMoarse.jsx";
import TaskMagnetic from "../components/TaskMagnetic.jsx";
import TaskDistance from "../components/TaskDistance.jsx";
import { runVictoryConfetti } from "../components/confetti.js";

const socket = io("/", { withCredentials: true });

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
          rows={taskNumber === 3 ? 1 : 5} // Single line for task 3 (9 chars)
          placeholder={taskNumber === 3 ? "Enter 9 digits (0=off, 1=N pole, 2=S pole): e.g., 101010121" : "Enter task details..."}
          maxLength={taskNumber === 3 ? 9 : undefined}
        />
        {taskNumber === 3 && (
          <p className="text-xs text-gray-500 mb-4">
            • 0: No pole (off)<br />
            • 1: North pole (N)<br />
            • 2: South pole (S)
          </p>
        )}
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
  const [showMenu, setShowMenu] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [members, setMembers] = useState([
    { name: "", email: "" },
    { name: "", email: "" },
    { name: "", email: "" },
    { name: "", email: "" }
  ]);
  const confettiTimeoutRef = useRef(null);

  // Save selected team to localStorage whenever it changes
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem("selectedTeam", selectedTeam);
    } else {
      localStorage.removeItem("selectedTeam");
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/getTeams");
      const data = await res.json();
      setTeams(data || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const getNextTaskFromStatus = (status) => {
    if (!status) return [1, 2];
    if (!status.task1Done || !status.task2Done) return [1, 2];
    if (!status.task3Done) return [3];
    if (!status.task4Done) return [4];
    return null;
  };

  // const runConfetti = async () => {
  //   try {
  //     const confetti = (await import("canvas-confetti")).default;
      
  //     const duration = 2000;
  //     const animationEnd = Date.now() + duration;
  //     const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  //     function randomInRange(min, max) {
  //       return Math.random() * (max - min) + min;
  //     }

  //     const interval = setInterval(function() {
  //       const timeLeft = animationEnd - Date.now();

  //       if (timeLeft <= 0) {
  //         return clearInterval(interval);
  //       }

  //       const particleCount = 50 * (timeLeft / duration);
        
  //       confetti({
  //         ...defaults,
  //         particleCount,
  //         origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
  //       });
  //       confetti({
  //         ...defaults,
  //         particleCount,
  //         origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
  //       });
  //     }, 250);

  //   } catch (err) {
  //     console.warn("Confetti import failed or not installed:", err.message);
  //   }
  // };

  const runFinalVictoryConfetti = async () => {
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
            runFinalVictoryConfetti();
            return updated;
          }
          
          return updated;
        });

        runVictoryConfetti();

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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
      window.location.href = "/dashboard/login";
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleRegistration = async (data) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("Server response:", result);
      if (res.ok) {
        fetchTeams();
        setSelectedTeam(data.teamName);
        // Reset form
        setTeamName("");
        setLeaderName("");
        setLeaderEmail("");
        setMembers([
          { name: "", email: "" },
          { name: "", email: "" },
          { name: "", email: "" },
          { name: "", email: "" }
        ]);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
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
      {/* Menu Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <button
              onClick={() => {
                setShowMenu(false);
                setShowRegisterModal(true);
              }}
              className="w-full px-6 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all font-medium text-gray-700 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Register
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                handleLogout();
              }}
              className="w-full px-6 py-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all font-medium text-red-600 flex items-center gap-3 border-t border-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

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
         {task === 1 ? (
            <TaskArrows 
              socket={socket} 
              onTaskComplete={handleDone}  
            />
          ) : null}
          {task === 2 ? (
            <TaskMoarse 
              socket={socket} 
              onTaskComplete={handleDone}  
            />
          ) : null}
          {task === 3 ? (
            <TaskMagnetic 
              socket={socket} 
              onTaskComplete={handleDone}  
            />
          ) : null}
          {task === 4 ? (
            <TaskDistance 
              socket={socket} 
              onTaskComplete={handleDone}  
            />
          ) : null}
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

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <h3 className="text-3xl font-bold mb-6 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Register Team
            </h3>
            
            <div className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter team name"
                />
              </div>

              {/* Team Leader */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Team Leader</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                      placeholder="Enter leader name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                      placeholder="Enter leader email"
                    />
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Team Members (Optional)</h4>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((member) => {
                    const index = member - 1;
                    return (
                      <div key={member} className="space-y-3 pb-6 border-b border-gray-300 last:border-b-0 last:pb-0">
                        <p className="text-sm font-semibold text-gray-600">Member {member}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                            <input
                              type="text"
                              value={members[index].name}
                              onChange={(e) => {
                                const newMembers = [...members];
                                newMembers[index].name = e.target.value;
                                setMembers(newMembers);
                              }}
                              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                              placeholder="Member name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input
                              type="email"
                              value={members[index].email}
                              onChange={(e) => {
                                const newMembers = [...members];
                                newMembers[index].email = e.target.value;
                                setMembers(newMembers);
                              }}
                              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-sm"
                              placeholder="Member email"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log("Register button clicked");
                  const data = {
                    teamName,
                    leaderName,
                    leaderEmail,
                    members
                  };
                  handleRegistration(data);
                  setShowRegisterModal(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;