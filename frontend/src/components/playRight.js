export const PlayRight = () => {
  const wrongSound = new Audio("/Victory.mp3"); 
  wrongSound.volume = 1;
  wrongSound.play().catch(() => {
    console.warn("⚠️ Audio playback blocked (user interaction required)");
  });
};