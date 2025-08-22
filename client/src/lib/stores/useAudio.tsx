import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  levelUpSound: HTMLAudioElement | null;
  deathSound: HTMLAudioElement | null;
  moveSound: HTMLAudioElement | null;
  isMuted: boolean;
  musicPlaying: boolean;
  needsUserInteraction: boolean;

  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setLevelUpSound: (sound: HTMLAudioElement) => void;
  setDeathSound: (sound: HTMLAudioElement) => void;
  setMoveSound: (sound: HTMLAudioElement) => void;

  // Control functions
  toggleMute: () => void;
  toggleMusic: () => void;
  unlockAudio: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playLevelUp: () => void;
  playDeath: () => void;
  playMove: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  levelUpSound: null,
  deathSound: null,
  moveSound: null,
  isMuted: false,
  musicPlaying: false,
  needsUserInteraction: false,

  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setLevelUpSound: (sound) => set({ levelUpSound: sound }),
  setDeathSound: (sound) => set({ deathSound: sound }),
  setMoveSound: (sound) => set({ moveSound: sound }),

  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;

    set({ isMuted: newMutedState });

    // Stop/start background music based on mute state
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(() => {
          set({ needsUserInteraction: true });
        });
      }
    }

    console.log(`Sound ${newMutedState ? "muted" : "unmuted"}`);
  },

  toggleMusic: () => {
    const { backgroundMusic, musicPlaying, isMuted } = get();
    if (backgroundMusic && !isMuted) {
      if (musicPlaying) {
        backgroundMusic.pause();
        set({ musicPlaying: false });
      } else {
        backgroundMusic
          .play()
          .then(() => {
            set({ musicPlaying: true, needsUserInteraction: false });
          })
          .catch(() => {
            console.log("Music needs user interaction");
            set({ needsUserInteraction: true });
          });
      }
    }
  },

  unlockAudio: () => {
    const { playBackgroundMusic } = get();
    playBackgroundMusic();
  },

  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }

      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch((error) => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },

  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.volume = 0.5;
      successSound.play().catch((error) => {
        console.log("Success sound play prevented:", error);
      });
    }
  },

  playLevelUp: () => {
    const { levelUpSound, isMuted } = get();
    if (levelUpSound && !isMuted) {
      levelUpSound.currentTime = 0;
      levelUpSound.volume = 0.6;
      levelUpSound.play().catch((error) => {
        console.log("Level up sound play prevented:", error);
      });
    }
  },

  playDeath: () => {
    const { deathSound, isMuted } = get();
    if (deathSound && !isMuted) {
      deathSound.currentTime = 0;
      deathSound.volume = 0.7;
      deathSound.play().catch((error) => {
        console.log("Death sound play prevented:", error);
      });
    }
  },

  playMove: () => {
    const { moveSound, isMuted } = get();
    if (moveSound && !isMuted) {
      // Reduce move sound frequency to avoid clicking noise
      if (Math.random() > 0.7) {
        // Only play 30% of the time
        const soundClone = moveSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.05;
        soundClone.play().catch((error) => {
          console.log("Move sound play prevented:", error);
        });
      }
    }
  },

  playBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.15;
      backgroundMusic.currentTime = 0;
      backgroundMusic
        .play()
        .then(() => {
          set({ musicPlaying: true, needsUserInteraction: false });
          console.log("Background music started");
        })
        .catch((error) => {
          console.log("Background music play prevented - user interaction needed");
          set({ needsUserInteraction: true });
        });
    }
  },

  stopBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  },
}));
