import React, { useState } from 'react';
import { useGameState } from '../lib/stores/useGameState';

const CraftingWorkshop: React.FC = () => {
  const { getAvailableRecipes, craftItem, canCraftItem, player, phase } = useGameState();
  const [selectedCategory, setSelectedCategory] = useState<string>('weapon');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  if (phase !== 'playing') return null;

  const availableRecipes = getAvailableRecipes();
  const categories = ['weapon', 'armor', 'potion', 'accessory'];
  
  const filteredRecipes = availableRecipes.filter((recipe: any) => 
    recipe.category === selectedCategory
  );

  const handleCraft = (recipeId: string) => {
    craftItem(recipeId);
    setSelectedRecipe(null);
  };

  const getCraftCheck = (recipeId: string) => {
    return canCraftItem(recipeId);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#FFFFFF';
      case 'uncommon': return '#1EFF00';
      case 'rare': return '#0070DD';
      case 'epic': return '#A335EE';
      case 'legendary': return '#FF8000';
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-black/90 text-white p-4 rounded border border-gray-600 w-96">
      <h3 className="text-lg font-bold mb-3 text-orange-400">合成工房</h3>
      
      <div className="mb-3">
        <p className="text-sm text-gray-400">合成レベル: {player.craftingLevel}</p>
      </div>

      {/* カテゴリタブ */}
      <div className="flex mb-3 border-b border-gray-600">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-sm ${
              selectedCategory === category 
                ? 'text-orange-400 border-b-2 border-orange-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {category === 'weapon' ? '武器' : 
             category === 'armor' ? '防具' : 
             category === 'potion' ? 'ポーション' : 'アクセサリ'}
          </button>
        ))}
      </div>

      {/* レシピリスト */}
      <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
        {filteredRecipes.length === 0 ? (
          <p className="text-gray-400">利用可能なレシピがありません</p>
        ) : (
          filteredRecipes.map((recipe: any) => {
            const craftCheck = getCraftCheck(recipe.id);
            return (
              <div 
                key={recipe.id}
                className={`p-2 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 ${
                  selectedRecipe === recipe.id ? 'bg-orange-900' : ''
                } ${!craftCheck.canCraft ? 'opacity-50' : ''}`}
                onClick={() => setSelectedRecipe(recipe.id)}
              >
                <div className="flex justify-between items-center">
                  <span 
                    className="font-medium"
                    style={{ color: getRarityColor(recipe.result.rarity) }}
                  >
                    {recipe.result.symbol} {recipe.result.name}
                  </span>
                  <span className="text-xs text-gray-400">Lv.{recipe.requiredLevel}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{recipe.result.description}</p>
                
                {/* 必要素材 */}
                <div className="text-xs text-gray-500 mt-1">
                  <span>必要素材: </span>
                  {recipe.materials.map((materialId: string, index: number) => (
                    <span key={index}>
                      {materialId}
                      {index < recipe.materials.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>

                {/* 作成可能性 */}
                {!craftCheck.canCraft && (
                  <div className="text-xs text-red-400 mt-1">
                    {craftCheck.missing.join(', ')}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 所持素材表示 */}
      <div className="mb-3 p-2 bg-gray-900 rounded">
        <h4 className="text-sm font-medium mb-2 text-gray-300">所持素材</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {player.inventory
            .filter(item => item.type === 'material' || item.type === 'gem')
            .reduce((acc: any[], item) => {
              const existing = acc.find(i => i.name === item.name);
              if (existing) {
                existing.count++;
              } else {
                acc.push({ ...item, count: 1 });
              }
              return acc;
            }, [])
            .map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span style={{ color: item.color }}>{item.symbol} {item.name}</span>
                <span className="text-gray-400">×{item.count}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* 合成ボタン */}
      {selectedRecipe && (
        <div className="pt-3 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">選択中のレシピ</span>
            <div className="space-x-2">
              <button
                onClick={() => handleCraft(selectedRecipe)}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={!getCraftCheck(selectedRecipe).canCraft}
              >
                合成
              </button>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
        <p>素材はモンスターを倒すことで入手できます</p>
        <p>合成レベルが上がると新しいレシピが利用可能になります</p>
      </div>
    </div>
  );
};

export default CraftingWorkshop;