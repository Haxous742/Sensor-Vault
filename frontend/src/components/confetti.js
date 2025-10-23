
export const runVictoryConfetti = async () => {
  try {
    const confetti = (await import("canvas-confetti")).default;

    // 🎵 Load sound
    const victorySound = new Audio("/Victory.mp3"); // put your sound in /public/sounds/
    victorySound.volume = 1; // adjust between 0–1
    victorySound.play().catch(() => {
      console.warn("⚠️ Audio playback blocked (user interaction required)");
    });

    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 120, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        victorySound.pause();
        victorySound.currentTime = 0;
        return;
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
    console.warn("Confetti or sound failed to load:", err.message);
  }
};
