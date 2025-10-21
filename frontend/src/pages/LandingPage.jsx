
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { FaMicrochip, FaTrophy } from "react-icons/fa";

/* ---------- Task Indicator ---------- */

const TaskIndicator = ({ completed, time, index }) => (
  <div className="flex flex-col items-center gap-1">
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.15, rotate: 360 }}
      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden ${
        completed
          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
          : "bg-gray-100 border border-gray-200"
      }`}
    >
      {completed && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-400 rounded-lg"
        />
      )}
      {completed ? (
        <svg
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white relative z-10"
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
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-300" />
      )}
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 + 0.2 }}
      className={`text-[9px] sm:text-[10px] font-semibold ${
        completed ? "text-emerald-600" : "text-gray-400"
      }`}
    >
      {time > 0 ? `${time}s` : "—"}
    </motion.div>
  </div>
);

/* ---------- Podium Card ---------- */

const PodiumCard = ({ rank, team, delay = 0 }) => {
  const ref = useRef(null);

  const rankConfig = {
    1: {
      gradient: "from-yellow-500 via-amber-600 to-amber-400",
      shadow: "shadow-[0_20px_40px_rgba(251,191,36,0.35)]",
      icon: "👑",
      label: "Champion",
      height: "h-70 sm:h-100",
    },
    2: {
      gradient: "from-rose-300 via-red-500 to-pink-400",
      shadow: "shadow-[0_15px_30px_rgba(148,163,184,0.3)]",
      icon: "🥈",
      label: "Runner Up",
      height: "h-70 sm:h-90",
    },
    3: {
      gradient: "from-sky-400 via-blue-500 to-sky-500",
      shadow: "shadow-[0_15px_30px_rgba(251,146,60,0.3)]",
      icon: "🥉",
      label: "Third Place",
      height: "h-70 sm:h-80",
    },
  };

  const config = rankConfig[rank];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 60, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.4)",
          delay: delay / 1000,
        }
      );
    }, el);
    return () => ctx.revert();
  }, [rank, delay]);

  return (
    <div ref={ref} className="flex flex-col items-end justify-end w-full sm:w-auto">
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`w-full sm:w-56 bg-white rounded-t-3xl p-4 sm:p-5 ${config.shadow} border border-gray-100 relative overflow-hidden ${config.height}`}
      >
        <motion.div
          animate={{ 
            scaleX: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`}
        />
        
        {/* Sparkle effect */}
        {Array(3).fill(0).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * -50],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut"
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: '20%'
            }}
          />
        ))}
        
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0 }}
          className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-center relative z-10"
        >
          {config.icon}
        </motion.div>
        <div className="text-center mb-2 sm:mb-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`inline-block px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-[10px] sm:text-xs font-bold text-white shadow-lg`}
          >
            {config.label}
          </motion.div>
        </div>
        <div className="text-center mb-3 sm:mb-4 text-base sm:text-lg font-black text-gray-900"
        style={{fontFamily:"Sakana,sans-serif"}}>
          {team.name}
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`text-center mb-4 sm:mb-5 py-2 sm:py-3 rounded-2xl bg-gradient-to-br ${config.gradient} relative overflow-hidden`}
        >
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-white/10 rounded-2xl" 
          />
          <div className="relative">
            <div className="text-[10px] sm:text-xs text-white/80">Total Time</div>
            <motion.div 
              key={team.overallTime}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl sm:text-3xl font-black text-white"
            >
              {team.overallTime}s
            </motion.div>
          </div>
        </motion.div>
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <TaskIndicator
                key={i}
                completed={team.tasksCompleted > i}
                time={team.taskTimes[i]}
                index={i}
              />
            ))}
        </div>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`w-full sm:w-56 bg-gradient-to-br ${config.gradient} h-10 sm:h-12 rounded-b-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <div className="text-white font-black text-xl sm:text-2xl relative z-10">#{rank}</div>
      </motion.div>
    </div>
  );
};

/* ---------- Team List Item ---------- */

const TeamListItem = ({ team, rank }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.05 }}
    layout
    whileHover={{
      x: 8,
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    }}
    className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-3 sm:p-4 shadow-md border border-gray-200 hover:border-indigo-400 transition-all max-w-2xl mx-auto relative overflow-hidden"
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    
    <div className="flex items-start gap-3 sm:gap-4 relative z-10">
      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg flex-shrink-0 relative overflow-hidden"
      >
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-white rounded-xl"
        />
        <span className="relative z-10">#{rank}</span>
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base sm:text-lg font-bold text-gray-900 mb-1 break-words sakana"
            >
              {team.name}
            </motion.div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold whitespace-nowrap"
              >
                {team.tasksCompleted}/4 Tasks
              </motion.span>
              {team.tasksCompleted === 4 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1 whitespace-nowrap"
                >
                  <motion.svg 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </motion.svg>
                  Complete
                </motion.span>
              )}
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <span className="font-black text-sm sm:text-base">{team.overallTime}s</span>
            </motion.div>
          </div>
        </div>

        <div className="flex justify-start gap-2 mt-1">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <TaskIndicator
                key={i}
                completed={team.tasksCompleted > i}
                time={team.taskTimes[i]}
                index={i}
              />
            ))}
        </div>
      </div>
    </div>
  </motion.div>
);

/* ---------- Main Component ---------- */

export default function LandingPage() {
  const [list, setList] = useState([]);

  const demo = [
    {
      name: "Voltage Vultures",
      tasksCompleted: 4,
      taskTimes: [95, 108, 175, 202],
      overallTime: 580,
    },
    {
      name: "Team Alpha",
      tasksCompleted: 3,
      taskTimes: [120, 180, 242, 0],
      overallTime: 542,
    },
    {
      name: "Sensor Lords",
      tasksCompleted: 2,
      taskTimes: [160, 220, 0, 0],
      overallTime: 380,
    },
    {
      name: "Resistor Rebels",
      tasksCompleted: 1,
      taskTimes: [300, 0, 0, 0],
      overallTime: 300,
    },
    {
      name: "Circuit Seekers",
      tasksCompleted: 2,
      taskTimes: [140, 210, 0, 0],
      overallTime: 350,
    },
    {
      name: "MagnetoOps",
      tasksCompleted: 0,
      taskTimes: [0, 0, 0, 0],
      overallTime: 0,
    },
  ];

  useEffect(() => {
    setList(demo);
  }, []);

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      {Array(100).fill(0).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full opacity-5"
          style={{
            background: `radial-gradient(circle, ${i % 2 === 0 ? '#6366f1' : '#a855f7'} 0%, transparent 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Unified Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden relative z-10"
      >
        {/* Header Section with Gradient Background */}
        <div className="relative bg-gradient-to-br from-pink-800 via-purple-900 to-fuchsia-700 px-4 sm:px-8 py-6 sm:py-10 overflow-hidden">
          {/* Animated Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div 
              animate={{ 
                x: [0, 20, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" 
            />
            <motion.div 
              animate={{ 
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" 
            />
          </div>
          
          {/* Floating Particles */}
          {Array(6).fill(0).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: '80%'
              }}
            />
          ))}
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl relative overflow-hidden"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl"
              />
              <FaMicrochip className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight uppercase"
              style={{fontFamily:"Sakana,sans-serif", letterSpacing:"0.08em"}}
            >
              The Sensor Vault
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 sm:gap-3 text-white/90 mb-4 sm:mb-6 text-sm sm:text-base"
            >
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="font-semibold"
              >
                Synergy'25
              </motion.span>
              <motion.span 
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-white/60" 
              />
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="font-semibold"
              >
                IIIT Bangalore
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* Current Team Playing Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative bg-gradient-to-r from-purple-600 to-pink-700 px-4 sm:px-6 py-3 sm:py-4 border-y border-indigo-400/50 overflow-hidden"
        >
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-2"
              style={{fontFamily:"Sakana,sans-serif"}}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full shadow-lg"
              />
              <span className="font-semibold text-white/90">LIVE</span>
            </div>
            <div className="h-3 sm:h-4 w-px bg-white/30" />
            <span className="font-medium text-white/80">Playing:</span>
            <motion.span 
              key="team-alpha"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm sm:text-base font-black text-white"
            >
              Team Alpha
            </motion.span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs font-medium text-white/70">Tasks:</span>
              <motion.span 
                key="3-4"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs sm:text-sm font-bold text-white"
              >
                3/4
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Content */}
        <div className="p-4 sm:p-8">
          {/* Top 3 */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              className="mb-2 sm:mb-3"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg relative overflow-hidden"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl"
                />
                <FaTrophy className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
              </motion.div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 sakana"
            >
              Top Performers
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xs sm:text-sm text-gray-500 font-medium text-center px-4"
            >
              Best times and completion rates
            </motion.p>
          </div>

          {/* Desktop Podium Layout */}
          <div className="hidden sm:flex justify-center items-end gap-3 sm:gap-4 md:gap-8 mb-8 sm:mb-10">
            {top3[1] && <PodiumCard rank={2} team={top3[1]} delay={100} />}
            {top3[0] && <PodiumCard rank={1} team={top3[0]} delay={150} />}
            {top3[2] && <PodiumCard rank={3} team={top3[2]} delay={200} />}
          </div>

          {/* Mobile Podium Layout */}
          <div className="flex sm:hidden flex-col justify-center items-center gap-5 mb-10">
            {top3[0] && <PodiumCard rank={1} team={top3[0]} delay={150} />}
            {top3[1] && <PodiumCard rank={2} team={top3[1]} delay={100} />}
            {top3[2] && <PodiumCard rank={3} team={top3[2]} delay={200} />}
          </div>

          {/* Divider */}
          {rest.length > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 my-8 sm:my-10">
              <motion.div 
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 1, delay: 1 }}
                className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent origin-left" 
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 360 }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wider sakana relative z-10">
                  All Teams
                </span>
              </motion.div>
              <motion.div 
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 1, delay: 1 }}
                className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent origin-right" 
              />
            </div>
          )}

          {/* Other Teams */}
          {rest.length > 0 && (
            <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
              <AnimatePresence>
                {rest.map((team, i) => (
                  <TeamListItem key={team.name} team={team} rank={i + 4} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer inside container */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-200 relative overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent"
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-lg"
                />
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <div className="text-xs sm:text-sm text-center sm:text-left">
                <div className="text-gray-600 font-medium">Organized by</div>
                <div className="text-indigo-600 font-black">Shivansh Shah, Aryan Sharma & Vedant Mundada</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <motion.svg 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </motion.svg>
                <span className="font-medium">Live Updates</span>
              </div>
              <div className="h-3 w-px bg-gray-300" />
              <span className="font-medium">Synergy 2025</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* CSS for Sakana font */
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');
  
  .sakana {
    font-family: 'Montserrat', sans-serif;
  }
`;
document.head.appendChild(style);