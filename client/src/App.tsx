import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAudio } from './lib/stores/useAudio';
import Game from './components/Game';
import '@fontsource/inter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Sound Manager Component
const SoundManager: React.FC = () => {
  const { 
    setHitSound, 
    setSuccessSound, 
    setBackgroundMusic, 
    setLevelUpSound, 
    setDeathSound, 
    setMoveSound,
    playBackgroundMusic 
  } = useAudio();

  useEffect(() => {
    // Load all sounds
    const hitAudio = new Audio('/sounds/hit.mp3');
    const successAudio = new Audio('/sounds/success.mp3');
    const backgroundAudio = new Audio('/sounds/background.mp3');
    
    // Create additional sounds using existing ones
    const levelUpAudio = new Audio('/sounds/success.mp3');
    const deathAudio = new Audio('/sounds/hit.mp3');
    const moveAudio = new Audio('/sounds/hit.mp3');
    
    // Set volumes
    hitAudio.volume = 0.3;
    successAudio.volume = 0.5;
    backgroundAudio.volume = 0.2;
    levelUpAudio.volume = 0.6;
    deathAudio.volume = 0.7;
    moveAudio.volume = 0.1;

    // Set all sounds
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
    setBackgroundMusic(backgroundAudio);
    setLevelUpSound(levelUpAudio);
    setDeathSound(deathAudio);
    setMoveSound(moveAudio);

    // Don't auto-start background music - wait for user interaction
  }, [setHitSound, setSuccessSound, setBackgroundMusic, setLevelUpSound, setDeathSound, setMoveSound, playBackgroundMusic]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-black">
        <SoundManager />
        <Game />
      </div>
    </QueryClientProvider>
  );
}

export default App;
