import React, { useState } from "react";
import { useGameState } from "../lib/stores/useGameState";

const SpellBook: React.FC = () => {
  const { getKnownSpells, castSpell, player, phase } = useGameState();
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);

  if (phase.current !== "playing") return null;

  const knownSpells = getKnownSpells();

  const handleCastSpell = (spellId: string) => {
    castSpell(spellId);
    setSelectedSpell(null);
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded border border-gray-600 w-80">
      <h3 className="text-lg font-bold mb-3 text-cyan-400">魔法書</h3>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {knownSpells.length === 0 ? (
          <p className="text-gray-400">習得済みの魔法がありません</p>
        ) : (
          knownSpells.map((spell: any) => (
            <div
              key={spell.id}
              className={`p-2 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 ${
                selectedSpell === spell.id ? "bg-blue-900" : ""
              }`}
              onClick={() => setSelectedSpell(spell.id)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium" style={{ color: spell.color }}>
                  {spell.symbol} {spell.name}
                </span>
                <span className="text-blue-400">MP{spell.manaCost}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{spell.description}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>射程: {spell.range === 0 ? "自分" : spell.range}</span>
                <span>Lv.{spell.level}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSpell && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-sm">
              現在MP: {player.mp}/{player.maxMp}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleCastSpell(selectedSpell)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                disabled={
                  player.mp < (knownSpells.find((s: any) => s.id === selectedSpell)?.manaCost || 0)
                }
              >
                詠唱
              </button>
              <button
                onClick={() => setSelectedSpell(null)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
        <p>キーボードショートカット:</p>
        <p>H: ヒール / F: ファイアボール</p>
      </div>
    </div>
  );
};

export default SpellBook;
