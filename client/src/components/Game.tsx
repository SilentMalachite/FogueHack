import React, { useEffect, useCallback, useState } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import GameMenu from "./GameMenu";
import GameMap from "./GameMap";
import GameUI from "./GameUI";
import SpellBook from "./SpellBook";
import CraftingWorkshop from "./CraftingWorkshop";
import { QuestLog } from "./QuestLog";
import AudioPermission from "./AudioPermission";

const Game: React.FC = () => {
  const {
    phase,
    movePlayer,
    castHeal,
    castFireball,
    castSpell,
    toggleInventory,
    saveGame,
    loadGame,
    startNewGame,
  } = useGameState();

  const { toggleMute, toggleMusic } = useAudio();
  const [showSpellBook, setShowSpellBook] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (phase === "menu") return;

      const key = event.key.toLowerCase();
      const { ctrlKey, shiftKey } = event;

      // 1) 修飾キー動作（移動と競合しないように先に処理）
      if (ctrlKey) {
        if (key === "s") {
          event.preventDefault();
          saveGame();
          return;
        }
        if (key === "l") {
          event.preventDefault();
          loadGame();
          return;
        }
        if (key === "r") {
          event.preventDefault();
          startNewGame();
          return;
        }
      }

      if (shiftKey) {
        if (key === "c") {
          event.preventDefault();
          setShowCrafting((v) => !v);
          return;
        }
        if (key === "q") {
          event.preventDefault();
          setShowQuestLog((v) => !v);
          return;
        }
      }

      // 2) 移動キー（無修飾）
      switch (key) {
        case "w":
        case "arrowup":
          event.preventDefault();
          movePlayer("north");
          return;
        case "s":
        case "arrowdown":
          event.preventDefault();
          movePlayer("south");
          return;
        case "a":
        case "arrowleft":
          event.preventDefault();
          movePlayer("west");
          return;
        case "d":
        case "arrowright":
          event.preventDefault();
          movePlayer("east");
          return;
        case "q":
          event.preventDefault();
          movePlayer("northwest");
          return;
        case "e":
          event.preventDefault();
          movePlayer("northeast");
          return;
        case "z":
          event.preventDefault();
          movePlayer("southwest");
          return;
        case "c":
          event.preventDefault();
          movePlayer("southeast");
          return;
      }

      // 3) 非移動の単独キー
      switch (key) {
        case "h":
          event.preventDefault();
          castHeal();
          return;
        case "f":
          event.preventDefault();
          castFireball();
          return;
        case "i":
          event.preventDefault();
          toggleInventory();
          return;
        case "m":
          event.preventDefault();
          toggleMute();
          return;
        case "b":
          event.preventDefault();
          toggleMusic();
          return;
        case "p":
          event.preventDefault();
          setShowSpellBook((v) => !v);
          return;
        case "escape":
          if (phase === "inventory") {
            event.preventDefault();
            toggleInventory();
          }
          return;
      }
    },
    [
      phase,
      movePlayer,
      castHeal,
      castFireball,
      toggleInventory,
      saveGame,
      loadGame,
      startNewGame,
      toggleMute,
      toggleMusic,
      showSpellBook,
      showCrafting,
      showQuestLog,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // ページを離れる前にオートセーブ
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (phase === "playing") {
        saveGame();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [phase, saveGame]);

  return (
    <div className="w-full h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      <GameMenu />

      {(phase === "playing" || phase === "inventory" || phase === "dead") && (
        <div className="flex h-full">
          {/* メインゲーム画面 */}
          <div className="flex-1 p-4 overflow-hidden">
            <GameMap />
          </div>

          {/* サイドUI */}
          <GameUI />

          {/* オーバーレイウィンドウ */}
          {showSpellBook && <SpellBook />}
          {showCrafting && <CraftingWorkshop />}
          {showQuestLog && <QuestLog onClose={() => setShowQuestLog(false)} />}
          <AudioPermission />
        </div>
      )}
    </div>
  );
};

export default Game;
