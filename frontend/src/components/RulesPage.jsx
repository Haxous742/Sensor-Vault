import React from "react";

const RulesPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden text-orange-100 p-8" style={{background: 'radial-gradient(1200px 600px at 20% 10%, rgba(255,117,24,0.15), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(106,13,173,0.15), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #0f0a06 100%)'}}>
      <style>{`
        @keyframes fogMove {0%{transform:translateX(-10%)}50%{transform:translateX(10%)}100%{transform:translateX(-10%)}}
        .halloween-fog{background: radial-gradient(800px 300px at 10% 30%, rgba(255,117,24,0.06), transparent 65%), radial-gradient(900px 380px at 90% 40%, rgba(106,13,173,0.08), transparent 65%); animation:fogMove 20s ease-in-out infinite; filter:blur(10px);}
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes twinkle {0%,100%{opacity:.7}50%{opacity:1}}
        .star{position:absolute;width:2px;height:2px;background:#FFE066;border-radius:50%;opacity:.8;animation:twinkle 2.4s ease-in-out infinite}
        @keyframes shoot {0%{transform:translateX(0) translateY(0);opacity:1}100%{transform:translateX(-40vw) translateY(20vh);opacity:0}}
        .shooting-star{position:absolute;width:120px;height:2px;background:linear-gradient(90deg, rgba(255,224,102,1) 0%, rgba(255,224,102,0) 100%);right:-120px;top:15%;transform:rotate(-20deg);animation:shoot 1.8s ease-out infinite;animation-delay:1s}
        .shooting-star.two{top:45%; animation-delay:3.5s}
        .shooting-star.three{top:70%; animation-delay:6s}
        .moon{position:absolute;right:4%;top:6%;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 30% 30%, #FFF6D4 0%, #FCE09B 40%, rgba(252,224,155,.1) 70%, transparent 72%);box-shadow:0 0 60px rgba(252,224,155,.25)}
        @keyframes fadeSlideIn {0%{opacity:0; transform:translateY(16px) scale(.98)} 60%{opacity:1; transform:translateY(-2px) scale(1.005)} 100%{opacity:1; transform:translateY(0) scale(1)}}
        .animate-fadeSlideIn{animation:fadeSlideIn .6s cubic-bezier(.2,.7,.2,1) both}
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 117, 24, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #FF7518, #6A0DAD);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #FF8530, #7A1DBD);
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
        <div className="h-full w-full halloween-fog" />
      </div>

      {/* Moon */}
      <div className="moon" aria-hidden />

      {/* Stars */}
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

      {/* Floating decorative icons */}
      <div className="absolute top-12 left-12 text-6xl float-icon pointer-events-none opacity-40" aria-hidden>🎃</div>
      <div className="absolute top-20 right-20 text-5xl float-icon pointer-events-none opacity-40" style={{ animationDelay: "0.5s" }} aria-hidden>🦇</div>
      <div className="absolute bottom-20 left-20 text-5xl float-icon pointer-events-none opacity-40" style={{ animationDelay: "1s" }} aria-hidden>👻</div>
      <div className="absolute bottom-24 right-32 text-4xl float-icon pointer-events-none opacity-40" style={{ animationDelay: "1.5s" }} aria-hidden>🕷️</div>

 

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeSlideIn">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-6xl">📜</span>
            <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-300 via-orange-200 to-purple-300 bg-clip-text text-transparent tracking-wide">
              Game Rules
            </h1>
            <span className="text-6xl">📜</span>
          </div>
          <p className="text-xl text-orange-200/80 font-medium">
            Complete all tasks before time runs out!
          </p>
        </div>

        {/* Content Container */}
        <div className="space-y-12">
          {/* Overview */}
          <section className="animate-fadeSlideIn" style={{animationDelay: '100ms'}}>
            <div className="bg-[#0f0a06] border-2 border-orange-700/40 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-orange-300 mb-6 flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                Overview
              </h2>
              <div className="bg-gradient-to-r from-orange-900/20 to-purple-900/20 rounded-2xl p-6 border border-orange-700/30">
                <p className="text-lg leading-relaxed text-orange-200/90">
                  This is a timed challenge game where teams compete to complete four tasks within <span className="font-bold text-orange-300">15 minutes</span>. Work together, solve puzzles, and beat the clock to achieve victory!
                </p>
              </div>
            </div>
          </section>

          {/* How to Play */}
   
          {/* Task Progression */}
          <section className="animate-fadeSlideIn" style={{animationDelay: '300ms'}}>
            <div className="bg-[#0f0a06] border-2 border-orange-700/40 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-orange-300 mb-6 flex items-center gap-3">
                <span className="text-4xl">🔓</span>
                Task Progression
              </h2>
              <div className="bg-gradient-to-br from-orange-900/20 via-purple-900/20 to-orange-900/20 rounded-2xl p-8 border border-orange-700/30">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-orange-600 to-purple-700 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg">1</div>
                    <div className="flex-1">
                      <p className="text-orange-200 font-semibold text-lg">Task 1 - Available immediately</p>
                      <p className="text-orange-300/70 text-sm mt-1">Start whenever you're ready</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-orange-600 to-purple-700 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg">2</div>
                    <div className="flex-1">
                      <p className="text-orange-200 font-semibold text-lg">Task 2 - Available immediately</p>
                      <p className="text-orange-300/70 text-sm mt-1">Can be completed in parallel with Task 1</p>
                    </div>
                  </div>
                  
                  <div className="ml-8 border-l-4 border-orange-500/50 pl-8 py-2">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-700 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg">3</div>
                      <div className="flex-1">
                        <p className="text-orange-200 font-semibold text-lg">Task 3 - Unlocks after Tasks 1 & 2</p>
                        <p className="text-orange-300/70 text-sm mt-1">Complete both previous tasks first</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-16 border-l-4 border-purple-500/50 pl-8 py-2">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-700 to-orange-600 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg">4</div>
                      <div className="flex-1">
                        <p className="text-orange-200 font-semibold text-lg">Task 4 - Unlocks after Task 3</p>
                        <p className="text-orange-300/70 text-sm mt-1">Final challenge to complete the game</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="animate-fadeSlideIn" style={{animationDelay: '400ms'}}>
            <div className="bg-[#0f0a06] border-2 border-orange-700/40 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-orange-300 mb-4">Instructions</h2>
<div className="grid md:grid-cols-2 gap-4">
  <div className="bg-red-900/20 border-l-4 border-red-500 rounded-r-xl p-5">
    <p className="text-orange-200/90">
      <span className="font-bold text-lg">⏱️ Time Limit:</span><br />
      You have exactly 15 minutes to complete all four tasks.
    </p>
  </div>

  <div className="bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-xl p-5 flex flex-col items-center">
    <p className="text-orange-200/90 text-center mb-3">
      <span className="font-bold text-lg">🚫 DO NOT OPEN</span><br />
      The “DO NOT OPEN” warning signs, as shown below, are real, please don’t open or tamper with any device.
    </p>
    <img
      src="/images/do-not-open-warning.png"
      alt="Do Not Open Warning"
      className="w-32 h-32 object-contain rounded-lg shadow-md border border-yellow-700"
    />
  </div>

  <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl p-5">
    <p className="text-orange-200/90">
      <span className="font-bold text-lg">📵 No Phones</span><br />
      The use of phones or any electronic device is not allowed.
    </p>
  </div>

  <div className="bg-green-900/20 border-l-4 border-green-500 rounded-r-xl p-5 flex flex-col items-center">
    <p className="text-orange-200/90 text-center mb-3">
      <span className="font-bold text-lg">🖐️ Touch Sensor</span><br />
      Some tasks need you to touch on specific locations to submit your answer.
      <br />
      The following symbol indicates where to touch:
    </p>
    <img
      src="/images/touch-here.png"
      alt="Touch Here Symbol"
      className="w-30 h-18 object-contain rounded-lg shadow-md border border-green-700 "
    />
  </div>
</div>

            </div>
          </section>

     
          
        </div>
      </div>
    </div>
  );
};

export default RulesPage;