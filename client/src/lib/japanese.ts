export const messages = {
  // ゲーム開始・終了
  welcome: "FogueHackへようこそ！",
  gameOver: "ゲームオーバー",
  youDied: "あなたは死んでしまった...",
  newGame: "新しいゲーム",
  continueGame: "ゲームを続ける",

  // 戦闘メッセージ
  youAttack: (monster: string, damage: number) =>
    `あなたは${monster}に${damage}のダメージを与えた！`,
  monsterAttacks: (monster: string, damage: number) =>
    `${monster}があなたに${damage}のダメージを与えた！`,
  youDefeat: (monster: string) => `あなたは${monster}をたおした！`,
  youGainExp: (exp: number) => `${exp}の経験値を得た！`,
  youGainGold: (gold: number) => `${gold}ゴールドを手に入れた！`,
  levelUp: (level: number) => `レベルアップ！レベル${level}になった！`,

  // アクション
  youMove: (direction: string) => `${direction}に移動した`,
  cannotMove: "そこには行けない",
  youPickUp: (item: string) => `${item}を拾った`,
  inventoryFull: "インベントリがいっぱいです",
  youEquip: (item: string) => `${item}を装備した`,
  youUnequip: (item: string) => `${item}を外した`,
  youUse: (item: string) => `${item}を使った`,

  // 魔法
  youCastHeal: (amount: number) => `ヒールを唱えた！${amount}回復した`,
  youCastFireball: (damage: number) => `ファイアボールを唱えた！${damage}のダメージ！`,
  notEnoughMp: "MPが足りない",

  // アイテム名
  items: {
    sword: "剣",
    dagger: "短剣",
    axe: "斧",
    leatherArmor: "革の鎧",
    chainMail: "チェインメイル",
    plateArmor: "プレートアーマー",
    healingPotion: "回復のポーション",
    manaPotion: "マナのポーション",
    scrollOfFireball: "ファイアボールの巻物",
    gold: "ゴールド",
  },

  // モンスター名
  monsters: {
    goblin: "ゴブリン",
    orc: "オーク",
    skeleton: "スケルトン",
    slime: "スライム",
    dragon: "ドラゴン",
    bat: "コウモリ",
    spider: "クモ",
    troll: "トロル",
  },

  // UI
  hp: "HP",
  mp: "MP",
  level: "レベル",
  exp: "経験値",
  attack: "攻撃力",
  defense: "防御力",
  gold: "ゴールド",
  inventory: "インベントリ",
  equipment: "装備",
  weapon: "武器",
  armor: "防具",

  // コントロール
  controls: {
    move: "移動: WASD または矢印キー",
    inventory: "インベントリ: I",
    heal: "ヒール: H",
    fireball: "ファイアボール: F",
    restart: "リスタート: R",
    save: "セーブ: S",
    load: "ロード: L",
    stairs: "階段: > を踏んで次の階へ",
  },

  // ダンジョン
  descend: "階段を降りる",
  newLevel: (level: number) => `地下${level}階に降りた！`,
  exploreNew: "新しいダンジョンを探索しよう！",
};

export function getRandomMessage(category: string[]): string {
  return category[Math.floor(Math.random() * category.length)];
}
