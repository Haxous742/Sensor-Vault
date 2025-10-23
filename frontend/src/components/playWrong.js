export const PlayWrong = () => {
  const wrongSound = new Audio("/Wrong.mp3"); // put your sound in /public/sounds/
  wrongSound.volume = 1; // adjust between 0–1
  wrongSound.play().catch(() => {
    console.warn("⚠️ Audio playback blocked (user interaction required)");
  });
};