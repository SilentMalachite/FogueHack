import React from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { Quest } from '../lib/questSystem';

interface QuestLogProps {
  onClose: () => void;
}

export const QuestLog: React.FC<QuestLogProps> = ({ onClose }) => {
  const gameState = useGameState();
  const { getAvailableQuests, getActiveQuests, getCompletedQuests, acceptQuest } = gameState;

  const availableQuests = getAvailableQuests();
  const activeQuests = getActiveQuests();
  const completedQuests = getCompletedQuests();

  const handleAcceptQuest = (questId: string) => {
    acceptQuest(questId);
  };

  const renderQuestObjectives = (quest: Quest) => {
    return quest.objectives.map(objective => (
      <div 
        key={objective.id} 
        className={`text-sm ml-4 ${objective.completed ? 'text-green-300' : 'text-yellow-300'}`}
      >
        {objective.completed ? '✓' : '○'} {objective.description} ({objective.current}/{objective.required})
      </div>
    ));
  };

  const renderQuestRewards = (quest: Quest) => {
    return (
      <div className="text-sm text-blue-300 ml-4">
        報酬: {quest.rewards.map(reward => {
          switch (reward.type) {
            case 'exp':
              return `経験値+${reward.value}`;
            case 'gold':
              return `ゴールド+${reward.value}`;
            case 'item':
              return `アイテム`;
            case 'spell':
              return `新魔法`;
            default:
              return '';
          }
        }).join(', ')}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-green-400 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-400">クエストログ</h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl font-bold px-3 py-1 border border-red-400 rounded"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 受諾可能なクエスト */}
          <div className="bg-gray-800 p-4 rounded border border-blue-400">
            <h3 className="text-lg font-bold text-blue-400 mb-3">受諾可能</h3>
            <div className="space-y-3">
              {availableQuests.length === 0 ? (
                <p className="text-gray-400 text-sm">利用可能なクエストはありません</p>
              ) : (
                availableQuests.map((quest: Quest) => (
                  <div key={quest.id} className="bg-gray-700 p-3 rounded border border-blue-300">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-blue-300">{quest.title}</h4>
                      <span className="text-xs text-gray-400">Lv.{quest.requiredLevel}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{quest.description}</p>
                    {renderQuestRewards(quest)}
                    <button
                      onClick={() => handleAcceptQuest(quest.id)}
                      className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded border border-blue-400"
                    >
                      受諾
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 進行中のクエスト */}
          <div className="bg-gray-800 p-4 rounded border border-yellow-400">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">進行中</h3>
            <div className="space-y-3">
              {activeQuests.length === 0 ? (
                <p className="text-gray-400 text-sm">進行中のクエストはありません</p>
              ) : (
                activeQuests.map((quest: Quest) => (
                  <div key={quest.id} className="bg-gray-700 p-3 rounded border border-yellow-300">
                    <h4 className="font-bold text-yellow-300 mb-2">{quest.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">{quest.description}</p>
                    <div className="mb-2">
                      {renderQuestObjectives(quest)}
                    </div>
                    {quest.timeLimit && (
                      <div className="text-xs text-red-400">
                        制限時間: {quest.timeLimit}ターン
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 完了したクエスト */}
          <div className="bg-gray-800 p-4 rounded border border-green-400">
            <h3 className="text-lg font-bold text-green-400 mb-3">完了済み</h3>
            <div className="space-y-3">
              {completedQuests.length === 0 ? (
                <p className="text-gray-400 text-sm">完了したクエストはありません</p>
              ) : (
                completedQuests.map((quest: Quest) => (
                  <div key={quest.id} className="bg-gray-700 p-3 rounded border border-green-300">
                    <h4 className="font-bold text-green-300 mb-2">{quest.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">{quest.description}</p>
                    <div className="text-sm text-green-400">
                      ✓ 完了
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-sm text-gray-400">
            <p><strong>操作方法:</strong></p>
            <p>• Qキー: クエストログを開く/閉じる</p>
            <p>• 受諾ボタン: 新しいクエストを開始</p>
            <p>• 進行中のクエストは自動的に進捗が更新されます</p>
          </div>
        </div>
      </div>
    </div>
  );
};