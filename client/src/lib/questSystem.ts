import { Player, Monster, Item, Position } from "./gameTypes";

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: "kill" | "collect" | "explore" | "craft" | "deliver";
  status: "available" | "active" | "completed" | "failed";
  objectives: QuestObjective[];
  rewards: QuestReward[];
  requiredLevel: number;
  timeLimit?: number; // ターン数制限
  prerequisiteQuests?: string[]; // 前提クエストID
}

export interface QuestObjective {
  id: string;
  description: string;
  type: "kill_monster" | "collect_item" | "reach_floor" | "craft_item" | "use_spell";
  target: string; // モンスター名、アイテムID、階層番号など
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: "exp" | "gold" | "item" | "spell";
  value: number;
  itemId?: string;
  spellId?: string;
}

export class QuestSystem {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();

  constructor() {
    this.initializeQuests();
  }

  private initializeQuests(): void {
    const questData: Quest[] = [
      // 初心者クエスト
      {
        id: "tutorial_kill",
        title: "初めての戦闘",
        description: "ダンジョンでモンスターを3体倒してください。",
        type: "kill",
        status: "available",
        objectives: [
          {
            id: "kill_any",
            description: "モンスターを倒す",
            type: "kill_monster",
            target: "any",
            current: 0,
            required: 3,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 50 },
          { type: "gold", value: 100 },
        ],
        requiredLevel: 1,
      },
      {
        id: "first_magic",
        title: "魔法の習得",
        description: "ヒールの魔法を1回使用してください。",
        type: "collect",
        status: "available",
        objectives: [
          {
            id: "use_heal",
            description: "ヒールを使用する",
            type: "use_spell",
            target: "heal",
            current: 0,
            required: 1,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 30 },
          { type: "item", value: 1, itemId: "mana_potion" },
        ],
        requiredLevel: 1,
      },
      {
        id: "collect_materials",
        title: "素材収集",
        description: "鉄鉱石を5個収集してください。",
        type: "collect",
        status: "available",
        objectives: [
          {
            id: "collect_iron",
            description: "鉄鉱石を収集する",
            type: "collect_item",
            target: "iron_ore",
            current: 0,
            required: 5,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 80 },
          { type: "gold", value: 200 },
          { type: "item", value: 1, itemId: "steel_sword" },
        ],
        requiredLevel: 2,
      },
      {
        id: "deep_exploration",
        title: "深層探索",
        description: "ダンジョンの5階まで到達してください。",
        type: "explore",
        status: "available",
        objectives: [
          {
            id: "reach_floor_5",
            description: "5階に到達する",
            type: "reach_floor",
            target: "5",
            current: 0,
            required: 1,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 150 },
          { type: "gold", value: 300 },
          { type: "spell", value: 1, spellId: "teleport" },
        ],
        requiredLevel: 3,
      },
      {
        id: "craft_mastery",
        title: "合成の達人",
        description: "鋼鉄の剣を合成してください。",
        type: "craft",
        status: "available",
        objectives: [
          {
            id: "craft_steel_sword",
            description: "鉄の剣を合成する",
            type: "craft_item",
            target: "iron_sword",
            current: 0,
            required: 1,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 100 },
          { type: "gold", value: 250 },
          { type: "item", value: 1, itemId: "mithril_ore" },
        ],
        requiredLevel: 3,
        prerequisiteQuests: ["collect_materials"],
      },
      {
        id: "orc_slayer",
        title: "オーク討伐",
        description: "オークを10体倒してください。",
        type: "kill",
        status: "available",
        objectives: [
          {
            id: "kill_orcs",
            description: "オークを倒す",
            type: "kill_monster",
            target: "orc",
            current: 0,
            required: 10,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 200 },
          { type: "gold", value: 400 },
          { type: "item", value: 1, itemId: "orc_slayer_sword" },
        ],
        requiredLevel: 4,
      },
      {
        id: "magic_master",
        title: "魔法の使い手",
        description: "ファイアボールを5回使用してください。",
        type: "collect",
        status: "available",
        objectives: [
          {
            id: "use_fireball",
            description: "ファイアボールを使用する",
            type: "use_spell",
            target: "fireball",
            current: 0,
            required: 5,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 120 },
          { type: "item", value: 3, itemId: "mana_potion" },
          { type: "spell", value: 1, spellId: "meteor" },
        ],
        requiredLevel: 5,
        prerequisiteQuests: ["first_magic"],
      },
      {
        id: "dragon_hunter",
        title: "竜狩りの者",
        description: "ドラゴンを1体倒してください。",
        type: "kill",
        status: "available",
        objectives: [
          {
            id: "kill_dragon",
            description: "ドラゴンを倒す",
            type: "kill_monster",
            target: "dragon",
            current: 0,
            required: 1,
            completed: false,
          },
        ],
        rewards: [
          { type: "exp", value: 500 },
          { type: "gold", value: 1000 },
          { type: "item", value: 1, itemId: "dragon_scale_armor" },
        ],
        requiredLevel: 8,
      },
    ];

    questData.forEach((quest) => {
      this.quests.set(quest.id, quest);
    });
  }

  getAvailableQuests(playerLevel: number): Quest[] {
    return Array.from(this.quests.values()).filter(
      (quest) =>
        quest.status === "available" &&
        quest.requiredLevel <= playerLevel &&
        this.arePrerequisitesMet(quest),
    );
  }

  getActiveQuests(): Quest[] {
    const activeQuestIds = Array.from(this.activeQuests);
    return activeQuestIds
      .map((id) => this.quests.get(id))
      .filter((quest) => quest !== undefined) as Quest[];
  }

  getCompletedQuests(): Quest[] {
    const completedQuestIds = Array.from(this.completedQuests);
    return completedQuestIds
      .map((id) => this.quests.get(id))
      .filter((quest) => quest !== undefined) as Quest[];
  }

  acceptQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== "available") {
      return false;
    }

    quest.status = "active";
    this.activeQuests.add(questId);
    return true;
  }

  private arePrerequisitesMet(quest: Quest): boolean {
    if (!quest.prerequisiteQuests) {
      return true;
    }

    return quest.prerequisiteQuests.every((prereqId) => this.completedQuests.has(prereqId));
  }

  updateQuestProgress(eventType: string, target: string, amount: number = 1): string[] {
    const messages: string[] = [];

    const activeQuestIds = Array.from(this.activeQuests);
    for (const questId of activeQuestIds) {
      const quest = this.quests.get(questId);
      if (!quest) continue;

      let questUpdated = false;

      for (const objective of quest.objectives) {
        if (objective.completed) continue;

        let shouldUpdate = false;

        switch (objective.type) {
          case "kill_monster":
            shouldUpdate =
              eventType === "monster_killed" &&
              (objective.target === "any" || objective.target === target);
            break;
          case "collect_item":
            shouldUpdate = eventType === "item_collected" && objective.target === target;
            break;
          case "reach_floor":
            shouldUpdate =
              eventType === "floor_reached" && parseInt(target) >= parseInt(objective.target);
            break;
          case "craft_item":
            shouldUpdate = eventType === "item_crafted" && objective.target === target;
            break;
          case "use_spell":
            shouldUpdate = eventType === "spell_used" && objective.target === target;
            break;
        }

        if (shouldUpdate) {
          objective.current = Math.min(objective.current + amount, objective.required);
          questUpdated = true;

          if (objective.current >= objective.required) {
            objective.completed = true;
            messages.push(`クエスト目標達成: ${objective.description}`);
          }
        }
      }

      if (questUpdated && this.isQuestCompleted(quest)) {
        this.completeQuest(questId);
        messages.push(`クエスト完了: ${quest.title}!`);
      }
    }

    return messages;
  }

  private isQuestCompleted(quest: Quest): boolean {
    return quest.objectives.every((obj) => obj.completed);
  }

  private completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = "completed";
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);
  }

  giveQuestRewards(questId: string, player: Player): string[] {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== "completed") {
      return [];
    }

    const messages: string[] = [];

    for (const reward of quest.rewards) {
      switch (reward.type) {
        case "exp":
          player.exp += reward.value;
          messages.push(`経験値 +${reward.value}`);
          break;
        case "gold":
          player.gold += reward.value;
          messages.push(`ゴールド +${reward.value}`);
          break;
        case "item":
          if (reward.itemId) {
            // アイテム報酬の処理は GameEngine で行う
            messages.push(`アイテム獲得: ${reward.itemId}`);
          }
          break;
        case "spell":
          if (reward.spellId && !player.knownSpells.includes(reward.spellId)) {
            player.knownSpells.push(reward.spellId);
            messages.push(`新しい魔法を習得: ${reward.spellId}`);
          }
          break;
      }
    }

    return messages;
  }

  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  getQuestProgress(questId: string): string {
    const quest = this.quests.get(questId);
    if (!quest) return "";

    const completedObjectives = quest.objectives.filter((obj) => obj.completed).length;
    const totalObjectives = quest.objectives.length;

    return `${completedObjectives}/${totalObjectives}`;
  }

  // セーブ/ロード用のデータ取得
  getQuestData() {
    return {
      activeQuests: Array.from(this.activeQuests),
      completedQuests: Array.from(this.completedQuests),
      questStates: Array.from(this.quests.entries()).map(([id, quest]) => ({
        id,
        status: quest.status,
        objectives: quest.objectives.map((obj) => ({
          id: obj.id,
          current: obj.current,
          completed: obj.completed,
        })),
      })),
    };
  }

  // セーブデータからの復元
  loadQuestData(data: any): void {
    if (!data) return;

    this.activeQuests = new Set(data.activeQuests || []);
    this.completedQuests = new Set(data.completedQuests || []);

    if (data.questStates) {
      data.questStates.forEach((state: any) => {
        const quest = this.quests.get(state.id);
        if (quest) {
          quest.status = state.status;
          state.objectives.forEach((objState: any) => {
            const objective = quest.objectives.find((obj) => obj.id === objState.id);
            if (objective) {
              objective.current = objState.current;
              objective.completed = objState.completed;
            }
          });
        }
      });
    }
  }
}
