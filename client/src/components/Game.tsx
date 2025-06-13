import React, { useEffect, useCallback, useState } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { useAudio } from '../lib/stores/useAudio';
import GameMenu from './GameMenu';
import GameMap from './GameMap';
import GameUI from './GameUI';
import SpellBook from './SpellBook';
import CraftingWorkshop from './CraftingWorkshop';
import { QuestLog } from './QuestLog';

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
    startNewGame
  } = useGameState();

  const { toggleMute, toggleMusic } = useAudio();
  const [showSpellBook, setShowSpellBook] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (phase === 'menu') return;

    const key = event.key.toLowerCase();
    
    // 移動キー
    switch (key) {
      case 'w':
      case 'arrowup':
        event.preventDefault();
        movePlayer('north');
        break;
      case 's':
      case 'arrowdown':
        event.preventDefault();
        movePlayer('south');
        break;
      case 'a':
      case 'arrowleft':
        event.preventDefault();
        movePlayer('west');
        break;
      case 'd':
      case 'arrowright':
        event.preventDefault();
        movePlayer('east');
        break;
      case 'q':
        event.preventDefault();
        movePlayer('northwest');
        break;
      case 'e':
        event.preventDefault();
        movePlayer('northeast');
        break;
      case 'z':
        event.preventDefault();
        movePlayer('southwest');
        break;
      case 'c':
        event.preventDefault();
        movePlayer('southeast');
        break;
    }

    // アクションキー
    switch (key) {
      case 'h':
        event.preventDefault();
        castHeal();
        break;
      case 'f':
        event.preventDefault();
        castFireball();
        break;
      case 'i':
        event.preventDefault();
        toggleInventory();
        break;
      case 's':
        if (event.ctrlKey || phase === 'playing') {
          event.preventDefault();
          saveGame();
        }
        break;
      case 'l':
        if (event.ctrlKey || phase === 'playing') {
          event.preventDefault();
          loadGame();
        }
        break;
      case 'm':
        event.preventDefault();
        toggleMute();
        break;
      case 'b':
        event.preventDefault();
        toggleMusic();
        break;
      case 'p':
        event.preventDefault();
        setShowSpellBook(!showSpellBook);
        break;
      case 'c':
        event.preventDefault();
        setShowCrafting(!showCrafting);
        break;
      case 'q':
        event.preventDefault();
        setShowQuestLog(!showQuestLog);
        break;
      case 'r':
        if (event.ctrlKey || phase === 'dead') {
          event.preventDefault();
          startNewGame();
        }
        break;
      case 'escape':
        if (phase === 'inventory') {
          event.preventDefault();
          toggleInventory();
        }
        break;
    }
  }, [phase, movePlayer, castHeal, castFireball, toggleInventory, saveGame, loadGame, startNewGame, toggleMute, toggleMusic, showSpellBook, showCrafting, showQuestLog]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // ページを離れる前にオートセーブ
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (phase === 'playing') {
        saveGame();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase, saveGame]);

  return (
    <div className="w-full h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      <GameMenu />
      
      {(phase === 'playing' || phase === 'inventory' || phase === 'dead') && (
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
        </div>
      )}
    </div>
  );
};

export default Game;
