import {
  GameState,
  Player,
  PlayerState,
  Monster,
  Item,
  Position,
  Direction,
  Spell,
  GamePhase,
  InventoryState,
} from "./gameTypes";
import { DungeonGenerator } from "./dungeonGenerator";
import { SpellSystem } from "./spellSystem";
import { CraftingSystem } from "./craftingSystem";
import { QuestSystem } from "./questSystem";
import { messages } from "./japanese";
export class GameEngine {
  private gameState: GameState;
  private dungeonGenerator: DungeonGenerator;
  private spellSystem: SpellSystem;
  private craftingSystem: CraftingSystem;
  private questSystem: QuestSystem;

  constructor() {
    this.dungeonGenerator = new DungeonGenerator();
    this.spellSystem = new SpellSystem();
    this.craftingSystem = new CraftingSystem();
    this.questSystem = new QuestSystem();
    this.gameState = this.initializeGame();
  }

  // Helper method to convert PlayerState to Player for compatibility with systems
  private playerStateToPlayer(playerState: PlayerState): Player {
    return {
      ...playerState,
      inventory: playerState.inventory.items,
    };
  }

  private initializeGame(): GameState {
    const dungeon = this.dungeonGenerator.generateDungeon();
    const playerPosition = this.dungeonGenerator.getRandomFloorPosition(dungeon);

    const player: PlayerState = {
      position: playerPosition,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      level: 1,
      exp: 0,
      expToNext: 100,
      attack: 10,
      defense: 5,
      inventory: { items: [], equipped: {}, craftingMaterials: new Map() },
      equipment: {},
      gold: 0,
      knownSpells: ["heal", "fireball", "magic_missile"], // 初期魔法
      magicPower: 8,
      craftingLevel: 1,
    };

    return {
      phase: { current: "menu", last: "menu" },
      dungeon,
      player,
      monsters: [],
      items: new Map(),
      itemPositions: new Map(),
      dungeonLevel: 1,
      turnCount: 0,
      messages: [messages.welcome],
      gameOver: false,
    };
  }

  startNewGame(): GameState {
    this.gameState = this.initializeGame();
    this.gameState.phase = { current: "playing", last: "menu" };
    this.generateMonstersAndItems();
    return { ...this.gameState };
  }

  private generateMonstersAndItems(): void {
    const monsterCount = 5 + this.gameState.dungeonLevel * 2;
    const itemCount = 3 + this.gameState.dungeonLevel;

    // モンスター生成
    for (let i = 0; i < monsterCount; i++) {
      const position = this.findRandomEmptyPosition();
      if (position) {
        const monster = this.createRandomMonster(position);
        this.gameState.monsters.push(monster);
      } else {
        console.warn(`Could not find empty position for monster ${i + 1}/${monsterCount}`);
      }
    }

    // アイテム生成
    for (let i = 0; i < itemCount; i++) {
      const position = this.findRandomEmptyPosition();
      if (position) {
        const item = this.createRandomItem();
        const positionKey = `${position.x},${position.y}`;
        this.gameState.items.set(item.id, item);
        this.gameState.itemPositions.set(positionKey, item.id);
      } else {
        console.warn(`Could not find empty position for item ${i + 1}/${itemCount}`);
      }
    }
  }

  private findRandomEmptyPosition(): Position | null {
    const attempts = 100;

    for (let i = 0; i < attempts; i++) {
      const position = this.dungeonGenerator.getRandomFloorPosition(this.gameState.dungeon);

      // プレイヤーの位置でないかチェック
      if (
        position.x === this.gameState.player.position.x &&
        position.y === this.gameState.player.position.y
      ) {
        continue;
      }

      // モンスターの位置でないかチェック
      const monsterExists = this.gameState.monsters.some(
        (m) => m.position.x === position.x && m.position.y === position.y,
      );

      // アイテムの位置でないかチェック
      const positionKey = `${position.x},${position.y}`;
      const itemExists = this.gameState.itemPositions.has(positionKey);

      if (!monsterExists && !itemExists) {
        return position;
      }
    }

    return null;
  }

  private createRandomMonster(position: Position): Monster {
    const monsterTypes = [
      {
        name: "slime",
        symbol: "s",
        color: "#00ff00",
        hp: 20,
        attack: 5,
        defense: 2,
        exp: 10,
        gold: 5,
      },
      {
        name: "goblin",
        symbol: "g",
        color: "#ffff00",
        hp: 30,
        attack: 8,
        defense: 3,
        exp: 15,
        gold: 10,
      },
      {
        name: "orc",
        symbol: "o",
        color: "#ff8800",
        hp: 50,
        attack: 12,
        defense: 5,
        exp: 25,
        gold: 20,
      },
      {
        name: "skeleton",
        symbol: "S",
        color: "#ffffff",
        hp: 40,
        attack: 10,
        defense: 4,
        exp: 20,
        gold: 15,
      },
    ];

    const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const levelBonus = this.gameState.dungeonLevel - 1;

    return {
      id: `monster_${Date.now()}_${Math.random()}`,
      position,
      hp: type.hp + levelBonus * 5,
      maxHp: type.hp + levelBonus * 5,
      attack: type.attack + levelBonus * 2,
      defense: type.defense + levelBonus,
      exp: type.exp + levelBonus * 5,
      gold: type.gold + levelBonus * 3,
      symbol: type.symbol,
      name: type.name,
      color: type.color,
      level: this.gameState.dungeonLevel,
    };
  }

  private createRandomItem(): Item {
    const itemTypes = [
      {
        name: "sword",
        type: "weapon",
        symbol: "/",
        color: "#cccccc",
        value: 50,
        effects: [{ type: "attack", value: 5 }],
      },
      {
        name: "dagger",
        type: "weapon",
        symbol: "-",
        color: "#cccccc",
        value: 30,
        effects: [{ type: "attack", value: 3 }],
      },
      {
        name: "leatherArmor",
        type: "armor",
        symbol: "[",
        color: "#8b4513",
        value: 40,
        effects: [{ type: "defense", value: 3 }],
      },
      {
        name: "healingPotion",
        type: "potion",
        symbol: "!",
        color: "#ff0000",
        value: 20,
        effects: [{ type: "heal", value: 30 }],
      },
      {
        name: "manaPotion",
        type: "potion",
        symbol: "!",
        color: "#0000ff",
        value: 25,
        effects: [{ type: "mana", value: 20 }],
      },
    ];

    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];

    return {
      id: `item_${Date.now()}_${Math.random()}`,
      name: type.name,
      type: type.type as "weapon" | "armor" | "potion",
      symbol: type.symbol,
      color: type.color,
      value: type.value,
      effects: type.effects as Array<{
        type: "heal" | "attack" | "defense" | "mana" | "speed" | "luck" | "magic_power";
        value: number;
      }>,
    };
  }

  movePlayer(direction: Direction): GameState {
    if (this.gameState.phase.current !== "playing") return { ...this.gameState };

    const newPosition = this.getNewPosition(this.gameState.player.position, direction);

    // 境界チェック
    if (!this.isValidPosition(newPosition)) {
      this.addMessage(messages.cannotMove);
      return { ...this.gameState };
    }

    // 壁チェック
    if (!this.gameState.dungeon[newPosition.y][newPosition.x].passable) {
      this.addMessage(messages.cannotMove);
      return { ...this.gameState };
    }

    // モンスターとの戦闘チェック
    const monster = this.getMonsterAt(newPosition);
    if (monster) {
      this.combat(monster);
      return { ...this.gameState };
    }

    // 階段チェック
    const currentTile = this.gameState.dungeon[newPosition.y][newPosition.x];
    if (currentTile.type === "stairs") {
      this.descend();
      return { ...this.gameState };
    }

    // アイテム取得チェック
    const positionKey = `${newPosition.x},${newPosition.y}`;
    if (this.gameState.itemPositions.has(positionKey)) {
      this.pickupItem(positionKey);
    }

    // プレイヤー移動
    this.gameState.player.position = newPosition;
    this.processTurn();

    return { ...this.gameState };
  }

  private getNewPosition(position: Position, direction: Direction): Position {
    const directions = {
      north: { x: 0, y: -1 },
      south: { x: 0, y: 1 },
      east: { x: 1, y: 0 },
      west: { x: -1, y: 0 },
      northeast: { x: 1, y: -1 },
      northwest: { x: -1, y: -1 },
      southeast: { x: 1, y: 1 },
      southwest: { x: -1, y: 1 },
    };

    const delta = directions[direction];
    return {
      x: position.x + delta.x,
      y: position.y + delta.y,
    };
  }

  private isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.gameState.dungeon[0].length &&
      position.y >= 0 &&
      position.y < this.gameState.dungeon.length
    );
  }

  private getMonsterAt(position: Position): Monster | null {
    return (
      this.gameState.monsters.find(
        (m) => m.position.x === position.x && m.position.y === position.y,
      ) || null
    );
  }

  private pickupItem(positionKey: string): void {
    const itemId = this.gameState.itemPositions.get(positionKey);
    if (!itemId) return;

    const item = this.gameState.items.get(itemId);
    if (!item) return;

    if (this.gameState.player.inventory.items.length < 20) {
      this.gameState.player.inventory.items.push(item);
      this.addMessage(
        messages.youPickUp(messages.items[item.name as keyof typeof messages.items] || item.name),
      );
      this.gameState.items.delete(itemId);
      this.gameState.itemPositions.delete(positionKey);
    } else {
      this.addMessage(messages.inventoryFull);
    }
  }

  private combat(monster: Monster): void {
    // プレイヤーの攻撃
    const playerDamage = Math.max(
      1,
      this.gameState.player.attack - monster.defense + Math.floor(Math.random() * 5),
    );

    // ダメージが負の値にならないようにする
    const actualPlayerDamage = Math.max(0, playerDamage);
    monster.hp -= actualPlayerDamage;

    const monsterName =
      messages.monsters[monster.name as keyof typeof messages.monsters] || monster.name;
    this.addMessage(messages.youAttack(monsterName, actualPlayerDamage));

    if (monster.hp <= 0) {
      // モンスター撃破
      this.addMessage(messages.youDefeat(monsterName));
      this.addMessage(messages.youGainExp(monster.exp));
      this.addMessage(messages.youGainGold(monster.gold));

      this.gameState.player.exp += monster.exp;
      this.gameState.player.gold += monster.gold;

      // クエスト進行更新
      const questMessages = this.questSystem.updateQuestProgress("monster_killed", monster.name);
      questMessages.forEach((msg) => this.addMessage(msg));

      // レベルアップチェック
      if (this.gameState.player.exp >= this.gameState.player.expToNext) {
        this.levelUp();
      }

      // モンスター撃破時に素材ドロップチェック
      const droppedMaterial = this.craftingSystem.calculateMaterialDrop(monster.level || 1);
      if (droppedMaterial) {
        this.gameState.player.inventory.items.push({
          ...droppedMaterial,
          id: `${droppedMaterial.id}_${Date.now()}`,
        });
        this.addMessage(`${droppedMaterial.name}を入手した！`);

        // 素材収集クエスト進行更新
        const collectMessages = this.questSystem.updateQuestProgress(
          "item_collected",
          droppedMaterial.id,
        );
        collectMessages.forEach((msg) => this.addMessage(msg));
      }

      // モンスター除去
      this.gameState.monsters = this.gameState.monsters.filter((m) => m.id !== monster.id);
      return;
    }

    // モンスターの反撃
    const monsterDamage = Math.max(
      1,
      monster.attack - this.gameState.player.defense + Math.floor(Math.random() * 3),
    );

    // ダメージが負の値にならないようにする
    const actualMonsterDamage = Math.max(0, monsterDamage);
    this.gameState.player.hp -= actualMonsterDamage;
    this.addMessage(messages.monsterAttacks(monsterName, actualMonsterDamage));

    if (this.gameState.player.hp <= 0) {
      this.gameState.phase = { current: "dead", last: this.gameState.phase.current };
      this.gameState.gameOver = true;
      this.addMessage(messages.youDied);
    }
  }

  private levelUp(): void {
    this.gameState.player.level++;
    this.gameState.player.exp -= this.gameState.player.expToNext;
    this.gameState.player.expToNext = this.gameState.player.level * 100;

    const hpIncrease = 20;
    const mpIncrease = 10;
    this.gameState.player.maxHp += hpIncrease;
    this.gameState.player.hp += hpIncrease;
    this.gameState.player.maxMp += mpIncrease;
    this.gameState.player.mp += mpIncrease;
    this.gameState.player.attack += 2;
    this.gameState.player.defense += 1;
    this.gameState.player.magicPower += 3;

    this.addMessage(messages.levelUp(this.gameState.player.level));

    // レベルアップ時に新しい魔法を習得
    this.learnNewSpells();
  }

  private learnNewSpells(): void {
    const availableSpells = this.spellSystem.getAvailableSpells(this.gameState.player.level);
    availableSpells.forEach((spell) => {
      if (!this.gameState.player.knownSpells.includes(spell.id)) {
        const playerAsPlayer = this.playerStateToPlayer(this.gameState.player);
        if (this.spellSystem.learnSpell(playerAsPlayer, spell.id)) {
          this.gameState.player.knownSpells.push(spell.id);
          this.addMessage(`新しい魔法「${spell.name}」を習得した！`);
        }
      }
    });
  }

  private processTurn(): void {
    this.gameState.turnCount++;

    // モンスターAI
    this.gameState.monsters.forEach((monster) => {
      this.moveMonster(monster);
    });
  }

  private moveMonster(monster: Monster): void {
    const playerPos = this.gameState.player.position;
    const monsterPos = monster.position;

    // プレイヤーとの距離を計算
    const dx = playerPos.x - monsterPos.x;
    const dy = playerPos.y - monsterPos.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    // 距離が5以下なら追跡
    if (distance <= 5) {
      let newX = monsterPos.x;
      let newY = monsterPos.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        newX += dx > 0 ? 1 : -1;
      } else {
        newY += dy > 0 ? 1 : -1;
      }

      const newPosition = { x: newX, y: newY };

      if (
        this.isValidPosition(newPosition) &&
        this.gameState.dungeon[newPosition.y][newPosition.x].passable
      ) {
        // プレイヤーの位置なら攻撃
        if (newPosition.x === playerPos.x && newPosition.y === playerPos.y) {
          const damage = Math.max(1, monster.attack - this.gameState.player.defense);
          this.gameState.player.hp -= damage;
          const monsterName =
            messages.monsters[monster.name as keyof typeof messages.monsters] || monster.name;
          this.addMessage(messages.monsterAttacks(monsterName, damage));

          if (this.gameState.player.hp <= 0) {
            this.gameState.phase = { current: "dead", last: this.gameState.phase.current };
            this.gameState.gameOver = true;
            this.addMessage(messages.youDied);
          }
        } else {
          // 他のモンスターがいないかチェック
          const otherMonster = this.getMonsterAt(newPosition);
          if (!otherMonster) {
            monster.position = newPosition;
          }
        }
      }
    }
  }

  castHeal(): GameState {
    return this.castSpell("heal");
  }

  castFireball(): GameState {
    return this.castSpell("fireball");
  }

  toggleInventory(): GameState {
    if (this.gameState.phase.current === "playing") {
      this.gameState.phase = { current: "inventory", last: "playing" };
    } else if (this.gameState.phase.current === "inventory") {
      this.gameState.phase = { current: "playing", last: "inventory" };
    }
    return { ...this.gameState };
  }

  useItem(itemId: string): GameState {
    const item = this.gameState.player.inventory.items.find((i) => i.id === itemId);
    if (!item) return { ...this.gameState };

    if (item.type === "potion") {
      item.effects?.forEach((effect) => {
        if (effect.type === "heal") {
          this.gameState.player.hp = Math.min(
            this.gameState.player.maxHp,
            this.gameState.player.hp + effect.value,
          );
        } else if (effect.type === "mana") {
          this.gameState.player.mp = Math.min(
            this.gameState.player.maxMp,
            this.gameState.player.mp + effect.value,
          );
        }
      });

      // アイテム消費
      this.gameState.player.inventory.items = this.gameState.player.inventory.items.filter(
        (i) => i.id !== itemId,
      );
      const itemName = messages.items[item.name as keyof typeof messages.items] || item.name;
      this.addMessage(messages.youUse(itemName));
    }

    return { ...this.gameState };
  }

  equipItem(itemId: string): GameState {
    const item = this.gameState.player.inventory.items.find((i) => i.id === itemId);
    if (!item) return { ...this.gameState };

    if (item.type === "weapon") {
      if (this.gameState.player.equipment.weapon) {
        this.gameState.player.inventory.items.push(this.gameState.player.equipment.weapon);
      }
      this.gameState.player.equipment.weapon = item;
      this.gameState.player.inventory.items = this.gameState.player.inventory.items.filter(
        (i) => i.id !== itemId,
      );

      const itemName = messages.items[item.name as keyof typeof messages.items] || item.name;
      this.addMessage(messages.youEquip(itemName));
    } else if (item.type === "armor") {
      if (this.gameState.player.equipment.armor) {
        this.gameState.player.inventory.items.push(this.gameState.player.equipment.armor);
      }
      this.gameState.player.equipment.armor = item;
      this.gameState.player.inventory.items = this.gameState.player.inventory.items.filter(
        (i) => i.id !== itemId,
      );

      const itemName = messages.items[item.name as keyof typeof messages.items] || item.name;
      this.addMessage(messages.youEquip(itemName));
    }

    return { ...this.gameState };
  }

  saveGame(): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      console.warn("Save/Load is only available in browser environment");
      return;
    }
    localStorage.setItem(
      "foguehack_save",
      JSON.stringify({
        ...this.gameState,
        items: Array.from(this.gameState.items.entries()),
        itemPositions: Array.from(this.gameState.itemPositions.entries()),
        player: {
          ...this.gameState.player,
          inventory: {
            ...this.gameState.player.inventory,
            craftingMaterials: Array.from(
              this.gameState.player.inventory.craftingMaterials.entries(),
            ),
          },
        },
        questData: this.questSystem.getQuestData(),
      }),
    );
  }

  loadGame(): GameState | null {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      console.warn("Save/Load is only available in browser environment");
      return null;
    }
    const saveData = localStorage.getItem("foguehack_save");
    if (!saveData) return null;

    try {
      const parsed = JSON.parse(saveData);

      // クエストデータの復元
      if (parsed.questData) {
        this.questSystem.loadQuestData(parsed.questData);
      }

      this.gameState = {
        ...parsed,
        items: new Map(parsed.items || []),
        itemPositions: new Map(parsed.itemPositions || []),
        player: {
          ...parsed.player,
          inventory: {
            ...parsed.player.inventory,
            craftingMaterials: new Map(parsed.player.inventory.craftingMaterials || []),
          },
        },
      };
      return { ...this.gameState };
    } catch (error) {
      console.error("Save data load error:", error);
      return null;
    }
  }

  private addMessage(message: string): void {
    this.gameState.messages.push(message);
    if (this.gameState.messages.length > 10) {
      this.gameState.messages.shift();
    }
  }

  private descend(): void {
    this.gameState.dungeonLevel++;
    this.addMessage(messages.newLevel(this.gameState.dungeonLevel));

    // 階層到達クエスト進行更新
    const floorMessages = this.questSystem.updateQuestProgress(
      "floor_reached",
      this.gameState.dungeonLevel.toString(),
    );
    floorMessages.forEach((msg) => this.addMessage(msg));

    // 新しいダンジョンを生成
    this.gameState.dungeon = this.dungeonGenerator.generateDungeon();

    // プレイヤーを新しい位置に配置
    this.gameState.player.position = this.dungeonGenerator.getRandomFloorPosition(
      this.gameState.dungeon,
    );

    // モンスターとアイテムをクリア
    this.gameState.monsters = [];
    this.gameState.items.clear();
    this.gameState.itemPositions.clear();

    // 新しいモンスターとアイテムを生成
    this.generateMonstersAndItems();

    // HPとMPを少し回復
    const healAmount = Math.floor(this.gameState.player.maxHp * 0.1);
    const mpAmount = Math.floor(this.gameState.player.maxMp * 0.1);
    this.gameState.player.hp = Math.min(
      this.gameState.player.maxHp,
      this.gameState.player.hp + healAmount,
    );
    this.gameState.player.mp = Math.min(
      this.gameState.player.maxMp,
      this.gameState.player.mp + mpAmount,
    );

    this.addMessage(messages.exploreNew);
  }

  // 魔法詠唱メソッド
  castSpell(spellId: string, targetPosition?: Position): GameState {
    const target = targetPosition || this.gameState.player.position;
    const playerAsPlayer = this.playerStateToPlayer(this.gameState.player);
    const result = this.spellSystem.castSpell(spellId, playerAsPlayer, target, this.gameState);

    if (!result.success) {
      throw new Error(result.message);
    }

    if (result.success && result.gameState) {
      this.gameState = result.gameState;

      // 魔法使用クエスト進行更新
      const spellMessages = this.questSystem.updateQuestProgress("spell_used", spellId);
      spellMessages.forEach((msg) => this.addMessage(msg));

      // 魔法で倒したモンスターのクエスト進行更新
      const killedMonsters = (this.gameState as any).killedMonsters;
      if (killedMonsters && Array.isArray(killedMonsters)) {
        killedMonsters.forEach((monsterName: string) => {
          const killMessages = this.questSystem.updateQuestProgress("monster_killed", monsterName);
          killMessages.forEach((msg) => this.addMessage(msg));
        });
        delete (this.gameState as any).killedMonsters;
      }
    }

    this.addMessage(result.message);
    this.processTurn();
    return this.gameState;
  }

  // アイテム合成メソッド
  craftItem(recipeId: string): GameState {
    const playerAsPlayer = this.playerStateToPlayer(this.gameState.player);
    const result = this.craftingSystem.craft(recipeId, playerAsPlayer);
    this.addMessage(result.message);

    if (result.success && result.item) {
      this.addMessage(`${result.item.name}を合成しました！`);

      // アイテム合成クエスト進行更新
      const craftMessages = this.questSystem.updateQuestProgress("item_crafted", result.item.id);
      craftMessages.forEach((msg) => this.addMessage(msg));
    }

    return this.gameState;
  }

  // 魔法一覧取得
  getKnownSpells(): Spell[] {
    return this.spellSystem.getKnownSpells(this.gameState.player.knownSpells);
  }

  // 合成レシピ一覧取得
  getAvailableRecipes() {
    return this.craftingSystem.getAvailableRecipes(this.gameState.player.craftingLevel);
  }

  // 合成可能性チェック
  canCraftItem(recipeId: string): { canCraft: boolean; missing: string[] } {
    const playerAsPlayer = this.playerStateToPlayer(this.gameState.player);
    return this.craftingSystem.canCraft(recipeId, playerAsPlayer);
  }

  // クエストシステムメソッド
  getAvailableQuests() {
    return this.questSystem.getAvailableQuests(this.gameState.player.level);
  }

  getActiveQuests() {
    return this.questSystem.getActiveQuests();
  }

  getCompletedQuests() {
    return this.questSystem.getCompletedQuests();
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  acceptQuest(questId: string): boolean {
    const success = this.questSystem.acceptQuest(questId);
    if (success) {
      const quest = this.questSystem.getQuest(questId);
      if (quest) {
        this.addMessage(`クエスト開始: ${quest.title}`);
      }
    }
    return success;
  }

  // 完了したクエストの報酬を受け取る
  claimQuestRewards(questId: string): void {
    const quest = this.questSystem.getQuest(questId);
    if (!quest || quest.status !== "completed") return;

    const playerAsPlayer = this.playerStateToPlayer(this.gameState.player);
    const rewardMessages = this.questSystem.giveQuestRewards(questId, playerAsPlayer);
    rewardMessages.forEach((msg) => this.addMessage(msg));

    // アイテム報酬の処理
    for (const reward of quest.rewards) {
      if (reward.type === "item" && reward.itemId) {
        const material = this.craftingSystem.getMaterial(reward.itemId);
        if (material) {
          for (let i = 0; i < reward.value; i++) {
            this.gameState.player.inventory.items.push({
              ...material,
              id: `${material.id}_${Date.now()}_${i}`,
            });
          }
        }
      }
    }

    // レベルアップチェック
    if (this.gameState.player.exp >= this.gameState.player.expToNext) {
      this.levelUp();
    }
  }
}
