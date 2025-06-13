import React from 'react';
import { useGameState } from '../lib/stores/useGameState';

const GameMap: React.FC = () => {
  const { dungeon, player, monsters, itemPositions } = useGameState();

  const renderMap = () => {
    if (!dungeon || dungeon.length === 0) return null;

    return dungeon.map((row, y) => (
      <div key={y} className="flex leading-none" style={{ height: '1em' }}>
        {row.map((tile, x) => {
          // プレイヤーの位置をチェック
          if (player.position.x === x && player.position.y === y) {
            return (
              <span
                key={x}
                className="text-white font-bold"
                style={{ width: '1ch' }}
              >
                @
              </span>
            );
          }

          // モンスターの位置をチェック
          const monster = monsters.find(m => m.position.x === x && m.position.y === y);
          if (monster) {
            return (
              <span
                key={x}
                style={{ color: monster.color, width: '1ch' }}
                className="font-bold"
              >
                {monster.symbol}
              </span>
            );
          }

          // アイテムの位置をチェック
          const positionKey = `${x},${y}`;
          const hasItem = Array.from(itemPositions.keys()).includes(positionKey);
          if (hasItem) {
            return (
              <span
                key={x}
                className="text-yellow-400 font-bold"
                style={{ width: '1ch' }}
              >
                *
              </span>
            );
          }

          // 通常のタイル（新しい色システム対応）
          return (
            <span
              key={x}
              style={{ 
                width: '1ch',
                color: tile.color || (
                  tile.type === 'wall' ? '#666' : 
                  tile.type === 'stairs' ? '#00FFFF' : 
                  tile.type === 'door' ? '#8B4513' :
                  tile.type === 'water' ? '#4169E1' :
                  tile.type === 'lava' ? '#FF4500' :
                  tile.type === 'pillar' ? '#A9A9A9' :
                  tile.type === 'chest' ? '#FFD700' :
                  '#999'
                )
              }}
              className={`font-mono ${tile.type === 'stairs' || tile.special ? 'font-bold' : ''}`}
            >
              {tile.symbol}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="font-mono text-sm leading-none overflow-hidden">
      {renderMap()}
    </div>
  );
};

export default GameMap;
