import React from "react";
import { useGameState } from "../lib/stores/useGameState";
import { messages } from "../lib/japanese";

const GameMenu: React.FC = () => {
  const { startNewGame, loadGame, phase } = useGameState();

  const handleNewGame = () => {
    startNewGame();
  };

  const handleLoadGame = () => {
    loadGame();
  };

  if (phase !== "menu") return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 font-mono">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8 text-green-300">FogueHack</h1>
        <p className="text-xl mb-12 text-green-500">ASCII ローグライク RPG</p>

        <div className="space-y-4">
          <button
            onClick={handleNewGame}
            className="block w-64 mx-auto py-3 px-6 text-xl border-2 border-green-400 hover:bg-green-400 hover:text-black transition-colors"
          >
            {messages.newGame}
          </button>

          <button
            onClick={handleLoadGame}
            className="block w-64 mx-auto py-3 px-6 text-xl border-2 border-green-400 hover:bg-green-400 hover:text-black transition-colors"
          >
            {messages.continueGame}
          </button>
        </div>

        <div className="mt-12 text-sm text-green-600">
          <p className="mb-2">{messages.controls.move}</p>
          <p className="mb-2">{messages.controls.inventory}</p>
          <p className="mb-2">{messages.controls.heal}</p>
          <p className="mb-2">{messages.controls.fireball}</p>
          <p className="mb-2">{messages.controls.save}</p>
          <p>{messages.controls.load}</p>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
