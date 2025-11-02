export interface Position {
  x: number;
  y: number;
}

export interface Player {
  position: Position;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  exp: number;
  expToNext: number;
  attack: number;
  defense: number;
  inventory: Item[];
  equipment: Equipment;
  gold: number;
  knownSpells: string[]; // 習得済み魔法のID
  magicPower: number; // 魔法攻撃力
  craftingLevel: number; // 合成レベル
}

export interface Monster {
  id: string;
  position: Position;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  symbol: string;
  name: string;
  color: string;
  level: number;
}

export interface Item {
  id: string;
  name: string;
  type: "weapon" | "armor" | "potion" | "scroll" | "misc" | "material" | "gem";
  symbol: string;
  color: string;
  value: number;
  effects?: ItemEffect[];
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  craftable?: boolean;
  materials?: string[]; // 合成に必要な素材のID
  description?: string;
}

export interface ItemEffect {
  type: "heal" | "mana" | "attack" | "defense" | "speed" | "luck" | "magic_power";
  value: number;
}

export interface Spell {
  id: string;
  name: string;
  type: "offensive" | "defensive" | "utility" | "healing";
  manaCost: number;
  damage?: number;
  healAmount?: number;
  range: number;
  description: string;
  level: number; // 必要レベル
  symbol: string;
  color: string;
  effects?: SpellEffect[];
}

export interface SpellEffect {
  type: "damage" | "heal" | "buff" | "debuff" | "teleport" | "summon";
  target: "self" | "enemy" | "area" | "all_enemies";
  duration?: number; // ターン数
  value: number;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
}

export interface DungeonTile {
  type: "wall" | "floor" | "door" | "stairs" | "water" | "lava" | "pillar" | "chest" | "trap";
  symbol: string;
  passable: boolean;
  color?: string;
  special?: boolean;
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "normal" | "treasure" | "boss" | "library" | "prison" | "shrine";
  connected: boolean;
  centerX: number;
  centerY: number;
}

export interface GameState {
  phase: GamePhase;
  dungeon: DungeonTile[][];
  player: PlayerState;
  monsters: Monster[];
  items: Map<string, Item>;
  itemPositions: Map<string, string>; // positionKey -> itemId
  dungeonLevel: number;
  turnCount: number;
  messages: string[];
  gameOver: boolean;
}

export interface GamePhase {
  current: "menu" | "playing" | "inventory" | "dead";
  last: "menu" | "playing" | "inventory" | "dead";
}

export interface PlayerState {
  position: Position;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  exp: number;
  expToNext: number;
  attack: number;
  defense: number;
  inventory: InventoryState;
  equipment: Equipment;
  gold: number;
  knownSpells: string[]; // 習得済み魔法のID
  magicPower: number; // 魔法攻撃力
  craftingLevel: number; // 合成レベル
}

export interface InventoryState {
  items: Item[];
  equipped: { weapon?: string; armor?: string; };
  craftingMaterials: Map<string, number>; // materialId -> quantity
}

export interface UIState {
  showInventory: boolean;
  showMenu: boolean;
  showCrafting: boolean;
  showSpellList: boolean;
  showQuestLog: boolean;
  selectedSlot: number;
  hoveredItem: string | null;
}

export enum Direction {
  North = "north",
  South = "south",
  East = "east",
  West = "west",
  Northeast = "northeast",
  Northwest = "northwest",
  Southeast = "southeast",
  Southwest = "southwest"
}
