import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import TaskArrows from "../components/TaskArrows.jsx";
import TaskMoarse from "../components/TaskMoarse.jsx";
import TaskMagnetic from "../components/TaskMagnetic.jsx";
import TaskDistance from "../components/TaskDistance.jsx";
import { PlayRight } from "../components/playRight.js";

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
    <div className="fixed inset-0 bg-tranparent bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 transform transition-all">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Task {taskNumber}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 text-black rounded-xl mb-6 focus:border-blue-500 focus:outline-none transition-colors resize-none"
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
  // const [tasksVersion, setTasksVersion] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
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
  const [showBats, setShowBats] = useState(false);
  const [showWitch, setShowWitch] = useState(false);

  // Trigger bat swarm and witch jumpscare on wrong answers
  const triggerBats = () => {
    setShowBats(true);
    setTimeout(() => {
      setShowBats(false);
      setShowWitch(true);
      setTimeout(() => setShowWitch(false), 2200);
    }, 2000);
  };

  // Halloween-themed confetti burst for correct answers
  const runHalloweenBurstConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 45,
        scalar: 1.2,
        ticks: 90,
        origin: { y: 0.6 },
        colors: ["#FF7518", "#6A0DAD", "#FFB000", "#32CD32", "#FFE066"],
      });
    } catch (err) {
      console.warn("Confetti import failed or not installed:", err.message);
    }
  };

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
          colors: ['#FF7518', '#6A0DAD', '#FFB000', '#32CD32', '#FFE066']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FF7518', '#6A0DAD', '#FFB000', '#32CD32', '#FFE066']
        });
      }, 150);

    } catch (err) {
      console.warn("Confetti import failed or not installed:", err.message);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Only animate once per session (not on every refresh)
  useEffect(() => {
    const alreadyAnimated = sessionStorage.getItem('halloween_animated');
    if (!alreadyAnimated) {
      setShouldAnimate(true);
      sessionStorage.setItem('halloween_animated', '1');
    } else {
      setShouldAnimate(false);
    }
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

    // Listen for wrong-answer events from tasks to trigger bats
    const wrongEvents = [
      'task_wrong',
      'answer_wrong',
      'task_incorrect',
      'answer_incorrect',
    ];
    wrongEvents.forEach((evt) => {
      socket.on(evt, () => triggerBats());
    });

    return () => {
      socket.off("timer_update");
      wrongEvents.forEach((evt) => socket.off(evt));
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

        PlayRight();
        runHalloweenBurstConfetti();

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
      <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden text-orange-100 p-8" style={{background: 'radial-gradient(1200px 600px at 20% 10%, rgba(255,117,24,0.15), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(106,13,173,0.15), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #0f0a06 100%)'}}>
        <style>{`@keyframes fogMove {0%{transform:translateX(-10%)}50%{transform:translateX(10%)}100%{transform:translateX(-10%)}} .halloween-fog{background: radial-gradient(800px 300px at 10% 30%, rgba(255,117,24,0.06), transparent 65%), radial-gradient(900px 380px at 90% 40%, rgba(106,13,173,0.08), transparent 65%); animation:fogMove 20s ease-in-out infinite; filter:blur(10px);} @keyframes batFly{0%{transform:translateX(-10%) translateY(0) scale(.9);opacity:0}10%{opacity:1}50%{transform:translateX(30vw) translateY(-10px) scale(1.05)}100%{transform:translateX(70vw) translateY(10px) scale(1);opacity:0}} .bat{width:48px;height:24px;animation:batFly 1.6s ease-in-out forwards;}`}</style>
        <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
          <div className="h-full w-full halloween-fog" />
        </div>
        <div className="bg-[#0f0a06] border border-orange-700/30 p-12 rounded-3xl shadow-[0_0_60px_rgba(255,117,24,0.15)] text-center max-w-2xl transform transition-all">
          {gameSuccess ? (
            <>
              <div className="text-8xl mb-6">🎃</div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                Congratulations!
              </h1>
              <p className="text-2xl text-orange-200 mb-6">
                Team <span className="font-bold text-orange-400">{selectedTeam}</span> completed all tasks!
              </p>
              <div className="text-6xl font-mono font-bold mb-8 text-orange-200">
                {formatTime(timer)}
              </div>
              <p className="text-lg text-orange-300/80 mb-8">
                Amazing job! You've successfully completed all challenges.
              </p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">🕯️</div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                Time's Up!
              </h1>
              <p className="text-2xl text-orange-200 mb-6">
                Better luck next time, <span className="font-bold text-orange-400">{selectedTeam}</span>!
              </p>
              <div className="text-6xl font-mono font-bold mb-8 text-orange-200">
                15:00
              </div>
              <p className="text-lg text-orange-300/80 mb-8">
                You ran out of time, but great effort! Try again to beat the clock.
              </p>
            </>
          )}
          <button
            onClick={handleBackToDashboard}
            className="px-10 py-4 bg-gradient-to-r from-orange-600 to-purple-700 text-white rounded-2xl hover:from-orange-500 hover:to-purple-600 transition-all shadow-lg font-semibold text-xl transform hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
        {showBats && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(14)].map((_, i) => (
              <svg key={i} viewBox="0 0 64 32" className="absolute bat" style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 90}%`,
                animationDelay: `${(i % 7) * 0.15}s`
              }}>
                <path d="M2 16c6-4 10 4 14 0 4-4 8 4 12 0 4-4 8 4 12 0 4-4 8 4 12 0" fill="none" stroke="#FF7518" strokeWidth="2"/>
                <path d="M22 16l4-4 4 4-4 4z" fill="#6A0DAD" />
              </svg>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-hidden text-orange-100 p-8" style={{background: 'radial-gradient(1200px 600px at 20% 10%, rgba(255,117,24,0.15), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(106,13,173,0.15), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #0f0a06 100%)'}}>
      <style>{`
        @keyframes fogMove {0%{transform:translateX(-10%)}50%{transform:translateX(10%)}100%{transform:translateX(-10%)}}
        .halloween-fog{background: radial-gradient(800px 300px at 10% 30%, rgba(255,117,24,0.06), transparent 65%), radial-gradient(900px 380px at 90% 40%, rgba(106,13,173,0.08), transparent 65%); animation:fogMove 20s ease-in-out infinite; filter:blur(10px);}
        @keyframes batFly{0%{transform:translateX(-10%) translateY(0) scale(.9);opacity:0}10%{opacity:1}50%{transform:translateX(30vw) translateY(-10px) scale(1.05)}100%{transform:translateX(70vw) translateY(10px) scale(1);opacity:0}}
        .bat{width:48px;height:24px;animation:batFly 1.6s ease-in-out forwards;}
        /* Stars */
        @keyframes twinkle {0%,100%{opacity:.7}50%{opacity:1}}
        .star{position:absolute;width:2px;height:2px;background:#FFE066;border-radius:50%;opacity:.8;animation:twinkle 2.4s ease-in-out infinite}
        /* Shooting stars */
        @keyframes shoot {0%{transform:translateX(0) translateY(0);opacity:1}100%{transform:translateX(-40vw) translateY(20vh);opacity:0}}
        .shooting-star{position:absolute;width:120px;height:2px;background:linear-gradient(90deg, rgba(255,224,102,1) 0%, rgba(255,224,102,0) 100%);right:-120px;top:15%;transform:rotate(-20deg);animation:shoot 1.8s ease-out infinite;animation-delay:1s}
        .shooting-star.two{top:45%; animation-delay:3.5s}
        .shooting-star.three{top:70%; animation-delay:6s}
        /* Floating pumpkins */
        @keyframes floatPumpkin {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .pumpkin{animation:floatPumpkin 3s ease-in-out infinite}
        /* Hanging spider */
        @keyframes swing {0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        .spider-thread{position:absolute;top:0;left:9.7%;width:4px;height:200px;background:rgba(255,255,255,.25)}
        .spider{position:absolute;top:100px;left:4%;animation:swing 2.4s ease-in-out infinite}
        /* Witch jumpscare */
        @keyframes witchZoom {0%{opacity:0; transform:translate(-50%,-50%) scale(.8) rotate(-10deg)} 15%{opacity:1; transform:translate(-50%,-50%) scale(1.3) rotate(8deg)} 35%{transform:translate(-50%,-50%) scale(1.1) rotate(-5deg)} 100%{opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg)}}
        .witch{position:fixed;left:50%;top:50%;animation:witchZoom 2.2s cubic-bezier(.05,.75,.45,.98) forwards}
        /* Moon */
        .moon{position:absolute;right:4%;top:6%;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 30% 30%, #FFF6D4 0%, #FCE09B 40%, rgba(252,224,155,.1) 70%, transparent 72%);box-shadow:0 0 60px rgba(252,224,155,.25)}
        /* Entry animations (inertia-like) */
        @keyframes fadeSlideIn {0%{opacity:0; transform:translateY(16px) scale(.98)} 60%{opacity:1; transform:translateY(-2px) scale(1.005)} 100%{opacity:1; transform:translateY(0) scale(1)}}
        .animate-fadeSlideIn{animation:fadeSlideIn .6s cubic-bezier(.2,.7,.2,1) both}
        @keyframes glowPulse {0%,100%{text-shadow:0 0 18px rgba(255,117,24,.25), 0 0 32px rgba(106,13,173,.2)} 50%{text-shadow:0 0 28px rgba(255,117,24,.35), 0 0 48px rgba(106,13,173,.3)}}
        .timer-glow{animation:glowPulse 2.2s ease-in-out infinite}
        @keyframes ringPulse {0%{transform:scale(.95); opacity:.4} 50%{transform:scale(1.02); opacity:.7} 100%{transform:scale(.95); opacity:.4}}
        .timer-ring{animation:ringPulse 3.2s ease-in-out infinite}
      `}</style>
      <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
        <div className="h-full w-full halloween-fog" />
      </div>
      {/* Decor: moon, stars, shooting stars, spider, pumpkins */}
      <div className="moon" aria-hidden />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[...Array(60)].map((_, i) => (
          <span key={i} className="star" style={{
            left: `${(i*17)%100}%`,
            top: `${(i*29)%100}%`,
            animationDelay: `${(i%10)*0.2}s`
          }} />
        ))}
        <div className="shooting-star" />
        <div className="shooting-star two" />
        <div className="shooting-star three" />
      </div>
      <div className="spider-thread" aria-hidden />
      <div className="spider" aria-hidden>
        <span role="img" aria-label="spider" className="text-[10rem] drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">🕷️</span>
      </div>
      {showBats && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-[60]">
          {[...Array(20)].map((_, i) => (
            <svg key={i} viewBox="0 0 64 32" className="absolute bat" style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 11) % 100}%`,
              animationDelay: `${(i % 8) * 0.1}s`
            }}>
              <path d="M2 16c6-4 10 4 14 0 4-4 8 4 12 0 4-4 8 4 12 0 4-4 8 4 12 0" fill="none" stroke="#FF7518" strokeWidth="2"/>
              <path d="M22 16l4-4 4 4-4 4z" fill="#6A0DAD" />
            </svg>
          ))}
        </div>
      )}
      {showWitch && (
        <div className="fixed inset-0 pointer-events-none z-[70]">
          <div className="witch text-[15rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.8)]">
            <span role="img" aria-label="witch jumpscare">🧙‍♀️</span>
          </div>
        </div>
      )}
      {/* Menu Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-3 rounded-xl bg-[#1a120c] border border-orange-700/30 text-orange-200 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0f0a06] text-orange-100 rounded-xl shadow-2xl border border-orange-700/30 overflow-hidden z-50">
            <button
              onClick={() => {
                setShowMenu(false);
                setShowRegisterModal(true);
              }}
              className="w-full px-6 py-3 text-left hover:bg-gradient-to-r hover:from-orange-900/40 hover:to-purple-900/40 transition-all font-medium text-orange-200 flex items-center gap-3"
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
              className="w-full px-6 py-3 text-left hover:bg-gradient-to-r hover:from-orange-900/40 hover:to-purple-900/40 transition-all font-medium text-red-400 flex items-center gap-3 border-t border-orange-700/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className={`relative mt-12 mb-10 ${shouldAnimate ? 'animate-fadeSlideIn' : ''}`}> 
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="timer-ring w-[340px] h-[340px] rounded-full" style={{background: 'radial-gradient(circle, rgba(255,117,24,.10) 0%, rgba(255,117,24,0) 60%)'}} />
          <div className="timer-ring w-[460px] h-[460px] rounded-full absolute" style={{background: 'radial-gradient(circle, rgba(106,13,173,.06) 0%, rgba(106,13,173,0) 65%)'}} />
        </div>
        <div className="text-[13.5vw] leading-none md:text-[11rem] lg:text-[12rem] font-extrabold font-mono bg-gradient-to-r from-orange-200 via-orange-50 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,117,24,0.35)] timer-glow text-center">
          {formatTime(timer)}
        </div>
      </div>

      <div className="container flex flex-row items-center justify-center max-w-5xl w-full flex-wrap gap-12 align-middle">
      <div className="flex space-x-4 mb-10">
        <button
          onClick={handleStart}
          disabled={!isValidTeam || !!activeTeam || isTeamCompleted}
          className={`px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-semibold text-lg ${
            !isValidTeam || !!activeTeam || isTeamCompleted
              ? "bg-gray-600/40 text-orange-300/40 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-600 to-purple-700 text-white hover:from-orange-500 hover:to-purple-600 shadow-[0_0_30px_rgba(255,117,24,0.3)]"
          }`}
        >
          Start
        </button>

        <button
          onClick={handleStop}
          disabled={!activeTeam || isTeamCompleted}
          className={`px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-semibold text-lg ${
            activeTeam && !isTeamCompleted
              ? "bg-gradient-to-r from-red-700 to-purple-800 text-white hover:from-red-600 hover:to-purple-700 shadow-[0_0_30px_rgba(255,0,0,0.25)]"
              : "bg-gray-600/40 text-orange-300/40 cursor-not-allowed"
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
          className={`w-full px-6 py-4 border-2 border-orange-700/30 rounded-2xl bg-[#1a120c] text-orange-100 shadow-lg focus:ring-4 text-lg font-medium transition-all ${
            activeTeam && activeTeam === selectedTeam && !isTeamCompleted
              ? "cursor-not-allowed bg-[#17110b] border-orange-700/30"
              : "focus:ring-orange-700/30 focus:border-orange-500 hover:border-orange-400"
          }`}
          disabled={activeTeam && activeTeam === selectedTeam && !isTeamCompleted}
          onFocus={() => selectedTeam && !(activeTeam && activeTeam === selectedTeam && !isTeamCompleted) && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />

        {showSuggestions && filteredTeams.length > 0 && (
          <ul className="absolute z-10 w-full mt-2 max-h-48 overflow-y-auto bg-[#0f0a06] text-orange-100 border-2 border-orange-700/30 rounded-2xl shadow-2xl">
            {filteredTeams.map((team, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(team)}
                className="px-6 py-3 hover:bg-gradient-to-r hover:from-orange-900/40 hover:to-purple-900/40 cursor-pointer transition-all font-medium first:rounded-t-2xl last:rounded-b-2xl"
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
          {[1, 2, 3, 4].map((task, idx) => (
            <div
              key={`${task}`}
              className={`bg-[#0f0a06] p-12 rounded-3xl shadow-xl flex flex-col items-center justify-center border-2 border-orange-700/30 hover:shadow-2xl transition-all transform hover:scale-105 ${shouldAnimate ? 'animate-fadeSlideIn' : ''}`}
              style={shouldAnimate ? {animationDelay: `${idx * 80}ms`} : {}}
            >
              <h2 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-orange-300 to-purple-300 bg-clip-text text-transparent tracking-wide">
                Task {task}
              </h2>

              <div className="flex space-x-5 text-lg">
            <button
                  onClick={() => isValidTeam && !isTeamCompleted && setEditTask(task)}
                  disabled={!isValidTeam || isTeamCompleted}
                  className={`px-7 py-3.5 rounded-xl text-white active:scale-95 transition-all transform font-bold shadow-lg border border-orange-700/50 tracking-wide ${
                    isValidTeam && !isTeamCompleted
                      ? "bg-gradient-to-r from-orange-600 to-purple-700 hover:from-orange-500 hover:to-purple-600"
                      : "bg-gray-600/40 text-orange-300/40 cursor-not-allowed"
                  }`}
                >
                  Edit
                </button>

            <button
                  onClick={() => handleDone(task)}
                  disabled={isTaskDisabled(task) || taskStatus[`task${task}Done`] || isTeamCompleted}
                  className={`px-7 py-3.5 rounded-xl text-white active:scale-95 transition-all transform font-bold shadow-lg border border-orange-700/50 tracking-wide ${
                    isTaskDisabled(task) || taskStatus[`task${task}Done`] || isTeamCompleted
                      ? "bg-gray-600/40 text-orange-300/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-purple-700 hover:from-orange-400 hover:to-purple-600"
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
  <div className={`grid ${currentTasks.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 w-full h-[60vh] mx-auto`}>
    {currentTasks.map((task, idx) => (
      <div
        key={`${task}`}
        className={`bg-gradient-to-br from-[#0f0a06] to-[#17110b] p-10 rounded-2xl shadow-lg border border-orange-700/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${shouldAnimate ? 'animate-fadeSlideIn' : ''}`}
        style={shouldAnimate ? {animationDelay: `${idx * 80}ms`} : {}}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-300 to-purple-300 bg-clip-text text-transparent tracking-wide">
            Task {task}
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => isValidTeam && setEditTask(task)}
              disabled={!isValidTeam}
              className={`group p-2.5 rounded-xl transition-all duration-300 ${
                isValidTeam
                  ? "bg-gradient-to-r from-orange-600 to-purple-700 hover:from-orange-500 hover:to-purple-600 text-white shadow-md hover:shadow-lg active:scale-95"
                  : "bg-gray-600/40 text-orange-300/40 cursor-not-allowed"
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
                  ? "bg-gray-600/40 text-orange-300/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-purple-700 hover:from-orange-400 hover:to-purple-600 text-white shadow-md hover:shadow-lg active:scale-95"
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
          <div className="bg-[#0f0a06] border border-orange-700/30 text-orange-100 p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Register Team
            </h3>
            
            <div className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-semibold text-orange-200 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-700/30 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-[#1a120c] text-orange-100"
                  placeholder="Enter team name"
                />
              </div>

              {/* Team Leader */}
              <div className="bg-gradient-to-r from-orange-900/20 to-purple-900/20 p-6 rounded-2xl border-2 border-orange-700/30">
                <h4 className="text-lg font-bold text-orange-100 mb-4">Team Leader</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-orange-200 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-700/30 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-[#1a120c] text-orange-100"
                      placeholder="Enter leader name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-orange-200 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-700/30 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-[#1a120c] text-orange-100"
                      placeholder="Enter leader email"
                    />
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-[#17110b] p-6 rounded-2xl border-2 border-orange-700/30">
                <h4 className="text-lg font-bold text-orange-100 mb-4">Team Members (Optional)</h4>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((member) => {
                    const index = member - 1;
                    return (
                      <div key={member} className="space-y-3 pb-6 border-b border-orange-700/30 last:border-b-0 last:pb-0">
                        <p className="text-sm font-semibold text-orange-200">Member {member}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-orange-300 mb-1">Name</label>
                            <input
                              type="text"
                              value={members[index].name}
                              onChange={(e) => {
                                const newMembers = [...members];
                                newMembers[index].name = e.target.value;
                                setMembers(newMembers);
                              }}
                              className="w-full px-4 py-2.5 border-2 border-orange-700/30 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-[#1a120c] text-orange-100 text-sm"
                              placeholder="Member name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-orange-300 mb-1">Email</label>
                            <input
                              type="email"
                              value={members[index].email}
                              onChange={(e) => {
                                const newMembers = [...members];
                                newMembers[index].email = e.target.value;
                                setMembers(newMembers);
                              }}
                              className="w-full px-4 py-2.5 border-2 border-orange-700/30 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-[#1a120c] text-orange-100 text-sm"
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
                className="px-6 py-2.5 bg-[#1a120c] text-orange-200 rounded-xl hover:bg-[#20150e] transition-all font-medium border border-orange-700/30"
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
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-purple-700 text-white rounded-xl hover:from-orange-500 hover:to-purple-600 transition-all shadow-lg font-medium"
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