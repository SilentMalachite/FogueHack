import React from "react";
import { useGameState } from "../lib/stores/useGameState";
import { messages } from "../lib/japanese";

const GameUI: React.FC = () => {
  const {
    player,
    messages: gameMessages,
    phase,
    dungeonLevel,
    turnCount,
    useItem: consumeItem,
    equipItem,
    startNewGame,
  } = useGameState();

  if (phase.current === "menu") return null;

  // インベントリ表示
  if (phase.current === "inventory") {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center font-mono text-green-400">
        <div className="bg-black border-2 border-green-400 p-6 max-w-2xl w-full mx-4">
          <h2 className="text-2xl mb-4 text-center">{messages.inventory}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 装備中アイテム */}
            <div>
              <h3 className="text-xl mb-2 text-green-300">{messages.equipment}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{messages.weapon}:</span>
                  <span className="text-yellow-400">
                    {player.equipment.weapon
                      ? messages.items[
                          player.equipment.weapon.name as keyof typeof messages.items
                        ] || player.equipment.weapon.name
                      : "なし"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{messages.armor}:</span>
                  <span className="text-yellow-400">
                    {player.equipment.armor
                      ? messages.items[
                          player.equipment.armor.name as keyof typeof messages.items
                        ] || player.equipment.armor.name
                      : "なし"}
                  </span>
                </div>
              </div>
            </div>

            {/* インベントリアイテム */}
            <div>
              <h3 className="text-xl mb-2 text-green-300">持ち物</h3>
              <div className="max-h-64 overflow-y-auto">
                {player.inventory.items.length === 0 ? (
                  <p className="text-gray-500">アイテムがありません</p>
                ) : (
                  player.inventory.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center mb-2 p-2 border border-gray-600"
                    >
                      <span>
                        {messages.items[item.name as keyof typeof messages.items] || item.name}
                      </span>
                      <div className="space-x-2">
                        {item.type === "potion" && (
                          <button
                            onClick={() => consumeItem(item.id)}
                            className="px-2 py-1 text-xs border border-blue-400 hover:bg-blue-400 hover:text-black"
                          >
                            使う
                          </button>
                        )}
                        {(item.type === "weapon" || item.type === "armor") && (
                          <button
                            onClick={() => equipItem(item.id)}
                            className="px-2 py-1 text-xs border border-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            装備
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">Iキーでインベントリを閉じる</p>
          </div>
        </div>
      </div>
    );
  }

  // ゲームオーバー画面
  if (phase.current === "dead") {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center font-mono text-red-400">
        <div className="bg-black border-2 border-red-400 p-8 text-center">
          <h2 className="text-4xl mb-4">{messages.gameOver}</h2>
          <p className="text-xl mb-6">{messages.youDied}</p>
          <button
            onClick={startNewGame}
            className="px-6 py-3 border-2 border-red-400 hover:bg-red-400 hover:text-black transition-colors"
          >
            {messages.newGame}
          </button>
        </div>
      </div>
    );
  }

  // メインゲームUI
  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-black bg-opacity-95 border-l-2 border-green-400 font-mono text-green-400 p-4">
      {/* プレイヤー情報 */}
      <div className="mb-6">
        <h2 className="text-xl mb-3 text-green-300">プレイヤー情報</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{messages.level}:</span>
            <span className="text-yellow-400">{player.level}</span>
          </div>
          <div className="flex justify-between">
            <span>{messages.hp}:</span>
            <span className={player.hp < player.maxHp * 0.3 ? "text-red-400" : "text-white"}>
              {player.hp}/{player.maxHp}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{messages.mp}:</span>
            <span className="text-blue-400">
              {player.mp}/{player.maxMp}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{messages.exp}:</span>
            <span className="text-purple-400">
              {player.exp}/{player.expToNext}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{messages.attack}:</span>
            <span className="text-red-300">{player.attack}</span>
          </div>
          <div className="flex justify-between">
            <span>{messages.defense}:</span>
            <span className="text-blue-300">{player.defense}</span>
          </div>
          <div className="flex justify-between">
            <span>{messages.gold}:</span>
            <span className="text-yellow-300">{player.gold}</span>
          </div>
        </div>
      </div>

      {/* ダンジョン情報 */}
      <div className="mb-6">
        <h2 className="text-xl mb-3 text-green-300">ダンジョン情報</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>階層:</span>
            <span className="text-white">{dungeonLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>ターン:</span>
            <span className="text-white">{turnCount}</span>
          </div>
        </div>
      </div>

      {/* メッセージログ */}
      <div className="mb-6">
        <h2 className="text-xl mb-3 text-green-300">メッセージ</h2>
        <div className="h-32 overflow-y-auto bg-gray-900 p-2 text-xs">
          {gameMessages.map((msg, index) => (
            <div key={index} className="mb-1">
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* コントロール */}
      <div>
        <h2 className="text-xl mb-3 text-green-300">コントロール</h2>
        <div className="text-xs space-y-1 text-gray-400">
          <div>移動: WASD/矢印</div>
          <div>インベントリ: I</div>
          <div>ヒール: H (MP 10)</div>
          <div>ファイアボール: F (MP 15)</div>
          <div>階段: {">"} を踏んで次の階へ</div>
          <div>セーブ: S</div>
          <div>ロード: L</div>
          <div>サウンド切替: M</div>
          <div>背景音楽: B</div>
          <div>魔法書: P</div>
          <div>合成工房: C</div>
          <div>クエスト: Q</div>
          <div>リスタート: R</div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
