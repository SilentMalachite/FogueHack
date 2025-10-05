# 🎮 FogueHack ゲームシステム詳細

## 概要

FogueHackは複数の相互作用するシステムで構成されています。各システムは独立して動作しつつ、統合されたゲーム体験を提供します。

## 🏗️ アーキテクチャ

```
GameEngine (中核)
├── DungeonGenerator (ダンジョン生成)
├── SpellSystem (魔法システム)
├── CraftingSystem (合成システム)
├── QuestSystem (クエストシステム)
└── GameState (状態管理)
```

---

## 🎯 GameEngine (ゲームエンジン)

### 概要
`client/src/lib/gameEngine.ts`

ゲームの中核となるクラス。全てのシステムを統合し、ゲームループを管理します。

### 主要メソッド

#### `startNewGame(): GameState`
新しいゲームを開始します。
- ダンジョン生成
- プレイヤー初期化
- モンスター・アイテム配置

#### `movePlayer(direction: Direction): GameState`
プレイヤーの移動を処理します。
- 境界・壁チェック
- モンスターとの戦闘
- アイテム取得
- 階段による階層移動

#### `combat(monster: Monster): void`
戦闘システムの実装。
- ダメージ計算：`max(1, 攻撃力 - 防御力 + ランダム要素)`
- 経験値・ゴールド獲得
- レベルアップ判定
- クエスト進行更新

---

## 🏰 DungeonGenerator (ダンジョン生成)

### 概要
`client/src/lib/dungeonGenerator.ts`

手続き的にダンジョンを生成するシステム。

### 生成アルゴリズム

1. **部屋配置**
   - メイン部屋を中央に配置
   - 追加部屋をランダム配置（重複回避）
   - 部屋タイプ：normal, treasure, boss, library, prison, shrine

2. **接続処理**
   - L字型廊下で部屋を接続
   - 全部屋への到達可能性を保証
   - フラッドフィルアルゴリズムで検証

3. **特殊要素配置**
   - 階段（ボス部屋優先）
   - 扉（30%確率）
   - トラップ（見た目は通常の床）
   - 環境要素（水、溶岩）

### 部屋タイプ詳細

| タイプ | 説明 | 特殊要素 |
|--------|------|----------|
| normal | 通常の部屋 | なし |
| treasure | 宝物庫 | 中央に宝箱 |
| boss | ボス部屋 | 四隅に柱、階段配置優先 |
| library | 図書館 | 壁際に本棚（柱） |
| prison | 牢獄 | 格子状の柱 |
| shrine | 神殿 | 中央に祭壇 |

---

## 🔮 SpellSystem (魔法システム)

### 概要
`client/src/lib/spellSystem.ts`

魔法の定義、習得、詠唱を管理するシステム。

### 魔法カテゴリ

#### 初級魔法 (レベル1-3)
- **ヒール**: HP回復
- **ファイアボール**: 範囲攻撃魔法
- **マジックミサイル**: 必中単体攻撃

#### 中級魔法 (レベル4-6)
- **アイスランス**: 凍結効果付き攻撃
- **ライトニングボルト**: 貫通攻撃
- **グレーターヒール**: 強力な回復+毒治癒
- **マジックシールド**: 防御力向上バフ

#### 上級魔法 (レベル7-10)
- **メテオ**: 範囲大ダメージ
- **テレポート**: 瞬間移動
- **タイムストップ**: 敵行動停止
- **リザレクション**: 完全回復

### 詠唱システム

```typescript
castSpell(spellId: string, target?: Position): {
  success: boolean;
  message: string;
  gameState?: GameState;
}
```

1. **前提条件チェック**
   - 魔法習得済みか
   - MP足りるか
   - 射程内か

2. **効果適用**
   - ダメージ計算：`基本ダメージ + 魔法攻撃力 - 敵防御力`
   - 回復計算：`基本回復量` (最大HPまで)
   - バフ・デバフ適用

3. **後処理**
   - MP消費
   - クエスト進行更新
   - ターン進行

---

## 🔨 CraftingSystem (合成システム)

### 概要
`client/src/lib/craftingSystem.ts`

素材を組み合わせてアイテムを作成するシステム。

### 素材カテゴリ

#### 基本素材
- **鉄鉱石** (common): 武器作りの基本
- **ミスリル鉱石** (rare): 高級武器用
- **ドラゴンの鱗** (epic): 最高級防具用
- **魔法の水晶** (uncommon): 魔法道具用
- **薬草** (common): ポーション基本材料

#### 宝石
- **ルビー**: 攻撃力強化
- **サファイア**: 魔法力強化
- **エメラルド**: 防御力強化
- **ダイヤモンド**: 全能力強化

### レシピシステム

```typescript
interface CraftingRecipe {
  id: string;
  result: Item;
  materials: string[]; // 必要素材ID
  requiredLevel: number;
  category: "weapon" | "armor" | "potion" | "accessory";
}
```

### 合成プロセス

1. **材料チェック**
   - 必要素材の所持確認
   - 合成レベル確認

2. **合成実行**
   - 材料消費
   - アイテム生成
   - 経験値獲得

3. **素材ドロップ**
   - モンスター撃破時30%確率
   - モンスターレベルに応じたレア度

---

## 📋 QuestSystem (クエストシステム)

### 概要
`client/src/lib/questSystem.ts`

クエストの管理、進行追跡、報酬付与を行うシステム。

### クエストタイプ

#### 討伐クエスト (kill)
- 指定モンスターの撃破
- 目標: 「任意のモンスター3体」「オーク10体」など

#### 収集クエスト (collect)
- アイテム・素材の収集
- 魔法使用回数も含む

#### 探索クエスト (explore)
- 指定階層への到達

#### 合成クエスト (craft)
- 指定アイテムの合成

#### 配達クエスト (deliver)
- 将来実装予定

### クエスト状態管理

```typescript
type QuestStatus = "available" | "active" | "completed" | "failed";
```

### 進行システム

```typescript
updateQuestProgress(eventType: string, target: string, amount: number = 1)
```

**イベントタイプ:**
- `monster_killed`: モンスター撃破
- `item_collected`: アイテム取得
- `floor_reached`: 階層到達
- `item_crafted`: アイテム合成
- `spell_used`: 魔法使用

### 報酬システム

```typescript
interface QuestReward {
  type: "exp" | "gold" | "item" | "spell";
  value: number;
  itemId?: string;
  spellId?: string;
}
```

---

## 🎵 AudioSystem (音響システム)

### 概要
`client/src/lib/stores/useAudio.tsx`

ゲーム内の音響効果を管理するシステム。

### 音声ファイル

- **background.mp3**: BGM（ループ再生）
- **hit.mp3**: 攻撃・ダメージ効果音
- **success.mp3**: 成功・回復効果音

### ブラウザポリシー対応

```typescript
const [needsUserInteraction, setNeedsUserInteraction] = useState(true);
```

ユーザーの最初のクリックで音声を有効化し、ブラウザの自動再生制限に対応。

---

## 💾 SaveSystem (セーブシステム)

### 概要
`localStorage`を使用したクライアントサイドセーブシステム。

### セーブデータ構造

```typescript
interface SaveData {
  // GameState のすべてのフィールド
  items: [string, Item][]; // Map を配列に変換
  itemPositions: [string, string][]; // Map を配列に変換
  questData: QuestSaveData; // クエスト進行状況
}
```

### セーブ・ロード処理

1. **セーブ**
   - GameState をシリアライズ
   - Map オブジェクトを配列に変換
   - localStorage に保存

2. **ロード**
   - JSON パース
   - 配列を Map に復元
   - クエストデータ復元
   - GameEngine に反映

---

## 🔄 システム間連携

### GameEngine → 各システム

```typescript
// 初期化時
this.spellSystem = new SpellSystem();
this.craftingSystem = new CraftingSystem();
this.questSystem = new QuestSystem();

// 使用時
const result = this.spellSystem.castSpell(spellId, player, target, gameState);
const craftResult = this.craftingSystem.craft(recipeId, player);
```

### クエスト進行の自動更新

```typescript
// モンスター撃破時
const questMessages = this.questSystem.updateQuestProgress("monster_killed", monster.name);

// 魔法使用時
const spellMessages = this.questSystem.updateQuestProgress("spell_used", spellId);

// アイテム合成時
const craftMessages = this.questSystem.updateQuestProgress("item_crafted", result.item.id);
```

### 状態管理の統合

```typescript
// useGameState.tsx
export const useGameState = create<GameStore>((set, get) => {
  const gameEngine = new GameEngine();
  
  return {
    ...initialState,
    gameEngine,
    
    // すべてのアクションは GameEngine を通る
    movePlayer: (direction) => {
      const newState = get().gameEngine.movePlayer(direction);
      set(newState);
    },
  };
});
```

---

## 🎮 ゲームループ

1. **プレイヤーアクション**
   - キー入力 → GameEngine メソッド呼び出し
   - UI操作 → useGameState アクション実行

2. **システム処理**
   - 各システムでの処理実行
   - GameState の更新

3. **AI・環境処理**
   - モンスターAI (`processTurn`)
   - 環境効果の適用

4. **UI更新**
   - React コンポーネントの再レンダリング
   - 音響効果の再生

5. **ゲーム状態の永続化**
   - オートセーブ（ページ離脱時）
   - 手動セーブ（Ctrl+S）

## 🔧 拡張ポイント

### 新システム追加
1. `client/src/lib/` に新システムクラス作成
2. `GameEngine` で初期化・統合
3. `useGameState` にアクション追加
4. UI コンポーネント作成

### 新クエストタイプ
1. `QuestSystem` に新 `ObjectiveType` 追加
2. `updateQuestProgress` にイベント処理追加
3. 該当システムでイベント発火

### 新魔法追加
1. `SpellSystem` の `initializeSpells` に定義追加
2. `applySpellEffects` に効果処理追加
3. 必要に応じて新エフェクトタイプ定義
