import { Item, Player, GameState } from './gameTypes';

export class CraftingSystem {
  private recipes: Map<string, CraftingRecipe> = new Map();
  private materials: Map<string, Item> = new Map();

  constructor() {
    this.initializeMaterials();
    this.initializeRecipes();
  }

  private initializeMaterials(): void {
    const materialData: Item[] = [
      // 基本素材
      {
        id: 'iron_ore',
        name: '鉄鉱石',
        type: 'material',
        symbol: '◆',
        color: '#708090',
        value: 10,
        rarity: 'common',
        description: '武器作りの基本素材'
      },
      {
        id: 'mithril_ore',
        name: 'ミスリル鉱石',
        type: 'material',
        symbol: '◆',
        color: '#C0C0C0',
        value: 50,
        rarity: 'rare',
        description: '高級武器の素材'
      },
      {
        id: 'dragon_scale',
        name: 'ドラゴンの鱗',
        type: 'material',
        symbol: '◇',
        color: '#8B0000',
        value: 100,
        rarity: 'epic',
        description: '最高級防具の素材'
      },
      {
        id: 'magic_crystal',
        name: '魔法の水晶',
        type: 'material',
        symbol: '♦',
        color: '#9400D3',
        value: 30,
        rarity: 'uncommon',
        description: '魔法道具の核となる素材'
      },
      {
        id: 'healing_herb',
        name: '薬草',
        type: 'material',
        symbol: '♠',
        color: '#228B22',
        value: 5,
        rarity: 'common',
        description: 'ポーションの基本材料'
      },
      {
        id: 'phoenix_feather',
        name: 'フェニックスの羽',
        type: 'material',
        symbol: '♧',
        color: '#FFD700',
        value: 200,
        rarity: 'legendary',
        description: '蘇生薬の貴重な材料'
      },

      // 宝石
      {
        id: 'ruby',
        name: 'ルビー',
        type: 'gem',
        symbol: '●',
        color: '#DC143C',
        value: 80,
        rarity: 'rare',
        description: '攻撃力を高める宝石'
      },
      {
        id: 'sapphire',
        name: 'サファイア',
        type: 'gem',
        symbol: '●',
        color: '#4169E1',
        value: 80,
        rarity: 'rare',
        description: '魔法力を高める宝石'
      },
      {
        id: 'emerald',
        name: 'エメラルド',
        type: 'gem',
        symbol: '●',
        color: '#50C878',
        value: 80,
        rarity: 'rare',
        description: '防御力を高める宝石'
      },
      {
        id: 'diamond',
        name: 'ダイヤモンド',
        type: 'gem',
        symbol: '●',
        color: '#B9F2FF',
        value: 150,
        rarity: 'epic',
        description: '全能力を高める最高の宝石'
      }
    ];

    materialData.forEach(material => {
      this.materials.set(material.id, material);
    });
  }

  private initializeRecipes(): void {
    const recipeData: CraftingRecipe[] = [
      // 武器レシピ
      {
        id: 'iron_sword',
        result: {
          id: 'iron_sword',
          name: '鉄の剣',
          type: 'weapon',
          symbol: '†',
          color: '#708090',
          value: 100,
          rarity: 'common',
          effects: [{ type: 'attack', value: 15 }],
          description: '頑丈な鉄製の剣'
        },
        materials: ['iron_ore', 'iron_ore', 'iron_ore'],
        requiredLevel: 1,
        category: 'weapon'
      },
      {
        id: 'mithril_sword',
        result: {
          id: 'mithril_sword',
          name: 'ミスリルの剣',
          type: 'weapon',
          symbol: '†',
          color: '#C0C0C0',
          value: 500,
          rarity: 'rare',
          effects: [{ type: 'attack', value: 30 }],
          description: '軽くて鋭いミスリル製の剣'
        },
        materials: ['mithril_ore', 'mithril_ore', 'magic_crystal'],
        requiredLevel: 5,
        category: 'weapon'
      },
      {
        id: 'ruby_sword',
        result: {
          id: 'ruby_sword',
          name: 'ルビーソード',
          type: 'weapon',
          symbol: '†',
          color: '#DC143C',
          value: 800,
          rarity: 'epic',
          effects: [
            { type: 'attack', value: 40 },
            { type: 'magic_power', value: 10 }
          ],
          description: 'ルビーが埋め込まれた魔法の剣'
        },
        materials: ['mithril_ore', 'mithril_ore', 'ruby', 'magic_crystal'],
        requiredLevel: 8,
        category: 'weapon'
      },

      // 防具レシピ
      {
        id: 'iron_armor',
        result: {
          id: 'iron_armor',
          name: '鉄の鎧',
          type: 'armor',
          symbol: '◘',
          color: '#708090',
          value: 150,
          rarity: 'common',
          effects: [{ type: 'defense', value: 12 }],
          description: '重厚な鉄製の鎧'
        },
        materials: ['iron_ore', 'iron_ore', 'iron_ore', 'iron_ore'],
        requiredLevel: 2,
        category: 'armor'
      },
      {
        id: 'dragon_armor',
        result: {
          id: 'dragon_armor',
          name: 'ドラゴンアーマー',
          type: 'armor',
          symbol: '◘',
          color: '#8B0000',
          value: 1000,
          rarity: 'legendary',
          effects: [
            { type: 'defense', value: 50 },
            { type: 'magic_power', value: 20 }
          ],
          description: 'ドラゴンの鱗で作られた伝説の鎧'
        },
        materials: ['dragon_scale', 'dragon_scale', 'mithril_ore', 'diamond'],
        requiredLevel: 10,
        category: 'armor'
      },

      // ポーションレシピ
      {
        id: 'health_potion',
        result: {
          id: 'health_potion',
          name: 'ヒールポーション',
          type: 'potion',
          symbol: '!',
          color: '#FF69B4',
          value: 50,
          rarity: 'common',
          effects: [{ type: 'heal', value: 50 }],
          description: 'HPを50回復するポーション'
        },
        materials: ['healing_herb', 'healing_herb'],
        requiredLevel: 1,
        category: 'potion'
      },
      {
        id: 'mana_potion',
        result: {
          id: 'mana_potion',
          name: 'マナポーション',
          type: 'potion',
          symbol: '!',
          color: '#4169E1',
          value: 60,
          rarity: 'common',
          effects: [{ type: 'mana', value: 30 }],
          description: 'MPを30回復するポーション'
        },
        materials: ['magic_crystal', 'healing_herb'],
        requiredLevel: 2,
        category: 'potion'
      },
      {
        id: 'phoenix_elixir',
        result: {
          id: 'phoenix_elixir',
          name: 'フェニックスエリクサー',
          type: 'potion',
          symbol: '!',
          color: '#FFD700',
          value: 1000,
          rarity: 'legendary',
          effects: [
            { type: 'heal', value: 999 },
            { type: 'mana', value: 999 }
          ],
          description: '完全回復の伝説的なエリクサー'
        },
        materials: ['phoenix_feather', 'healing_herb', 'magic_crystal', 'diamond'],
        requiredLevel: 10,
        category: 'potion'
      },

      // 魔法道具レシピ
      {
        id: 'magic_staff',
        result: {
          id: 'magic_staff',
          name: '魔法の杖',
          type: 'weapon',
          symbol: '♪',
          color: '#9400D3',
          value: 300,
          rarity: 'uncommon',
          effects: [
            { type: 'attack', value: 8 },
            { type: 'magic_power', value: 25 }
          ],
          description: '魔法攻撃に特化した杖'
        },
        materials: ['magic_crystal', 'magic_crystal', 'sapphire'],
        requiredLevel: 4,
        category: 'weapon'
      }
    ];

    recipeData.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }

  getAvailableRecipes(craftingLevel: number): CraftingRecipe[] {
    return Array.from(this.recipes.values()).filter(recipe => recipe.requiredLevel <= craftingLevel);
  }

  getRecipesByCategory(category: string, craftingLevel: number): CraftingRecipe[] {
    return this.getAvailableRecipes(craftingLevel).filter(recipe => recipe.category === category);
  }

  canCraft(recipeId: string, player: Player): { canCraft: boolean; missing: string[] } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return { canCraft: false, missing: [] };

    if (player.craftingLevel < recipe.requiredLevel) {
      return { canCraft: false, missing: ['レベル不足'] };
    }

    const missing: string[] = [];
    const materialCounts = new Map<string, number>();

    // 必要素材をカウント
    recipe.materials.forEach(materialId => {
      materialCounts.set(materialId, (materialCounts.get(materialId) || 0) + 1);
    });

    // インベントリの素材をカウント
    const inventoryCounts = new Map<string, number>();
    player.inventory.forEach(item => {
      if (item.type === 'material' || item.type === 'gem') {
        inventoryCounts.set(item.id, (inventoryCounts.get(item.id) || 0) + 1);
      }
    });

    // 不足している素材をチェック
    materialCounts.forEach((needed, materialId) => {
      const available = inventoryCounts.get(materialId) || 0;
      if (available < needed) {
        const material = this.materials.get(materialId);
        missing.push(`${material?.name || materialId} (${needed - available}個不足)`);
      }
    });

    return { canCraft: missing.length === 0, missing };
  }

  craft(recipeId: string, player: Player): { success: boolean; message: string; item?: Item } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return { success: false, message: 'レシピが見つかりません' };
    }

    const craftCheck = this.canCraft(recipeId, player);
    if (!craftCheck.canCraft) {
      return { 
        success: false, 
        message: `合成できません: ${craftCheck.missing.join(', ')}` 
      };
    }

    // 素材を消費
    const materialCounts = new Map<string, number>();
    recipe.materials.forEach(materialId => {
      materialCounts.set(materialId, (materialCounts.get(materialId) || 0) + 1);
    });

    materialCounts.forEach((needed, materialId) => {
      let remaining = needed;
      for (let i = player.inventory.length - 1; i >= 0 && remaining > 0; i--) {
        const item = player.inventory[i];
        if (item.id === materialId) {
          player.inventory.splice(i, 1);
          remaining--;
        }
      }
    });

    // アイテムを作成
    const newItem = { ...recipe.result };
    newItem.id = `${newItem.id}_${Date.now()}`; // ユニークなIDを生成

    // インベントリに追加
    player.inventory.push(newItem);

    // 合成経験値を獲得
    const expGain = recipe.requiredLevel * 10;
    this.gainCraftingExp(player, expGain);

    return { 
      success: true, 
      message: `${newItem.name}を合成しました！`, 
      item: newItem 
    };
  }

  private gainCraftingExp(player: Player, exp: number): void {
    const expToNextLevel = player.craftingLevel * 100;
    player.exp += exp; // 通常の経験値も獲得
    
    // 合成レベルアップ判定（簡易実装）
    if (player.exp >= expToNextLevel && player.craftingLevel < 10) {
      player.craftingLevel++;
    }
  }

  getMaterial(id: string): Item | undefined {
    return this.materials.get(id);
  }

  getRecipe(id: string): CraftingRecipe | undefined {
    return this.recipes.get(id);
  }

  // 素材ドロップ確率計算
  calculateMaterialDrop(monsterLevel: number): Item | null {
    const dropChance = Math.random();
    const materials = Array.from(this.materials.values());
    
    if (dropChance < 0.3) { // 30%の確率で素材ドロップ
      const availableMaterials = materials.filter(material => {
        switch (material.rarity) {
          case 'common': return monsterLevel >= 1;
          case 'uncommon': return monsterLevel >= 3;
          case 'rare': return monsterLevel >= 5;
          case 'epic': return monsterLevel >= 8;
          case 'legendary': return monsterLevel >= 10;
          default: return true;
        }
      });

      if (availableMaterials.length > 0) {
        return availableMaterials[Math.floor(Math.random() * availableMaterials.length)];
      }
    }
    
    return null;
  }
}

interface CraftingRecipe {
  id: string;
  result: Item;
  materials: string[]; // 必要素材のID配列
  requiredLevel: number;
  category: 'weapon' | 'armor' | 'potion' | 'accessory';
}