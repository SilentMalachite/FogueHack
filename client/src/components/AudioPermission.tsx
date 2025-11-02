import React from "react";
import { useAudio } from "@/lib/stores/useAudio";

export const AudioPermission: React.FC = () => {
  const { needsUserInteraction, unlockAudio, isMuted } = useAudio();

  if (!needsUserInteraction || isMuted) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 rounded-md border border-yellow-400 bg-black/80 text-yellow-300 px-4 py-2 shadow">
        <span className="text-sm">音声を有効にするにはクリックしてください</span>
        <button
          onClick={unlockAudio}
          className="px-3 py-1 text-sm border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors"
        >
          有効にする
        </button>
      </div>
    </div>
  );
};

export default AudioPermission;
