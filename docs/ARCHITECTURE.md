# 🏗️ FogueHack アーキテクチャ仕様書

## システム概要

FogueHackは、フロントエンドとバックエンドが分離されたモダンなWeb アプリケーションです。ゲームロジックは主にクライアントサイドで動作し、バックエンドはユーザー管理とデータ永続化を担当します。

## 🎯 アーキテクチャ図

```
┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Server        │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   React     │ │ ── │ │  Express.js │ │
│ │ Components  │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Zustand    │ │    │ │  API Routes │ │
│ │  Stores     │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ GameEngine  │ │    │ │  Storage    │ │
│ │ (Core Logic)│ │    │ │  Layer      │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ localStorage│ │    │ │ Database    │ │
│ │ (Game Save) │ │    │ │ (User Data) │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

## 📁 ディレクトリ構造

```
FogueHack/
├── client/                    # フロントエンド
│   ├── public/               # 静的アセット
│   │   ├── sounds/           # 音声ファイル
│   │   └── test-console.html # テストコンソール
│   ├── src/
│   │   ├── components/       # React コンポーネント
│   │   │   ├── Game.tsx      # メインゲーム画面
│   │   │   ├── GameMap.tsx   # ダンジョンマップ描画
│   │   │   ├── GameUI.tsx    # UI（ステータス、インベントリ）
│   │   │   ├── GameMenu.tsx  # メニュー画面
│   │   │   ├── SpellBook.tsx # 魔法書UI
│   │   │   ├── CraftingWorkshop.tsx # 合成UI
│   │   │   └── QuestLog.tsx  # クエストログUI
│   │   ├── lib/              # ゲームロジック
│   │   │   ├── stores/       # 状態管理
│   │   │   │   ├── useGameState.tsx  # メインゲーム状態
│   │   │   │   └── useAudio.tsx      # 音響管理
│   │   │   ├── gameEngine.ts      # コアゲームエンジン
│   │   │   ├── gameTypes.ts       # 型定義
│   │   │   ├── dungeonGenerator.ts # ダンジョン生成
│   │   │   ├── spellSystem.ts     # 魔法システム
│   │   │   ├── craftingSystem.ts  # 合成システム
│   │   │   ├── questSystem.ts     # クエストシステム
│   │   │   ├── japanese.ts        # 日本語メッセージ
│   │   │   └── queryClient.ts     # API クライアント
│   │   ├── hooks/            # カスタムフック
│   │   ├── test/             # テストファイル
│   │   ├── errorDetection.ts # エラー検出
│   │   ├── errorFixes.ts     # エラー修正
│   │   ├── finalValidation.ts # 最終検証
│   │   ├── main.tsx          # エントリポイント
│   │   └── index.css         # グローバルスタイル
│   └── index.html            # HTMLテンプレート
├── server/                   # バックエンド
│   ├── index.ts             # サーバーエントリポイント
│   ├── routes.ts            # API ルート定義
│   ├── storage.ts           # データストレージ抽象化
│   └── vite.ts              # Vite 開発サーバー統合
├── shared/                  # 共有コード
│   └── schema.ts            # データベーススキーマ
├── docs/                    # ドキュメント
├── .serena/memories/        # プロジェクトメモリ
├── logs/                    # ログファイル
└── dist/                    # ビルド成果物
```

## 🔄 データフロー

### ゲームプレイ時のデータフロー

```
1. User Input (Keyboard/Mouse)
         ↓
2. React Event Handler
         ↓
3. Zustand Action (useGameState)
         ↓
4. GameEngine Method Call
         ↓
5. Game Systems (Spell/Quest/Crafting)
         ↓
6. GameState Update
         ↓
7. React Re-render
         ↓
8. UI Update + Audio Effects
```

### API通信時のデータフロー

```
1. Frontend API Call (queryClient.ts)
         ↓
2. HTTP Request to Server
         ↓
3. Express Route Handler
         ↓
4. Storage Layer (storage.ts)
         ↓
5. Database Operation
         ↓
6. Response to Frontend
         ↓
7. State Update (if needed)
```

## 🎮 ゲームエンジン設計

### Core Classes

```typescript
// メインエンジン
class GameEngine {
  private gameState: GameState;
  private dungeonGenerator: DungeonGenerator;
  private spellSystem: SpellSystem;
  private craftingSystem: CraftingSystem;
  private questSystem: QuestSystem;
  
  // ゲームループ
  startNewGame(): GameState;
  movePlayer(direction: Direction): GameState;
  castSpell(spellId: string): GameState;
  // ...
}
```

### State Management Pattern

```typescript
// Zustand Store パターン
export const useGameState = create<GameStore>((set, get) => {
  const gameEngine = new GameEngine();
  
  return {
    // State
    ...initialState,
    gameEngine,
    
    // Actions
    movePlayer: (direction) => {
      const newState = get().gameEngine.movePlayer(direction);
      set(newState); // Immutable update
    },
  };
});
```

### システム間通信

```typescript
// Event-driven アーキテクチャ
class GameEngine {
  castSpell(spellId: string): GameState {
    // 1. 魔法システムで処理
    const result = this.spellSystem.castSpell(spellId, ...);
    
    // 2. クエストシステムに通知
    const questMessages = this.questSystem.updateQuestProgress(
      "spell_used", spellId
    );
    
    // 3. 状態統合
    this.gameState = result.gameState;
    questMessages.forEach(msg => this.addMessage(msg));
    
    return this.gameState;
  }
}
```

## 🌐 バックエンド設計

### レイヤード アーキテクチャ

```
┌─────────────────┐
│  Express Routes │  ← HTTP リクエスト処理
├─────────────────┤
│  Business Logic │  ← ビジネスロジック
├─────────────────┤
│  Storage Layer  │  ← データアクセス抽象化
├─────────────────┤
│  Database       │  ← データ永続化
└─────────────────┘
```

### Storage Pattern

```typescript
// 抽象インターフェース
interface IStorage {
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(userData: InsertUser): Promise<User>;
}

// 実装（現在はメモリ、将来はDB）
class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  // ...
}
```

## 🔐 セキュリティ設計

### 現在の対策

```typescript
// Helmet - セキュリティヘッダー
app.use(helmet());

// CORS - オリジン制限
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate Limiting
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
}));

// Sensitive Data Masking
function maskSensitive(value: any): any {
  // パスワード等の機密情報をマスク
}
```

### 将来の拡張

- JWT認証
- RBAC（Role-Based Access Control）
- API キー管理
- データベース暗号化

## 📱 フロントエンド設計

### Component 設計原則

```typescript
// Single Responsibility
const GameMap = () => {
  // マップ描画のみに責任を限定
};

const GameUI = () => {
  // UI表示のみに責任を限定
};

// Container-Presenter パターン
const Game = () => {
  // 状態管理とイベントハンドリング
  const gameState = useGameState();
  
  return (
    <div>
      <GameMap dungeon={gameState.dungeon} />
      <GameUI player={gameState.player} />
    </div>
  );
};
```

### State Management 戦略

```typescript
// Zustand を使用したシンプルな状態管理
// Redux の boilerplate を避けつつ、型安全性を保持

// グローバル状態は最小限に
// ローカル状態は React.useState を使用
// 複雑な状態ロジックは custom hooks に分離
```

## 🔄 Build & Deploy プロセス

### Development

```bash
# 並行実行
npm run dev
├── tsx server/index.ts      # サーバー起動
└── vite                     # クライアント開発サーバー
```

### Production Build

```bash
npm run build
├── vite build              # クライアントビルド → dist/public/
└── esbuild server/index.ts # サーバーバンドル → dist/index.js
```

### Deployment Strategy

```
1. GitHub Actions CI/CD
   ├── TypeScript チェック
   ├── Lint & Format チェック
   ├── Tests 実行
   └── Build 検証

2. Production Deploy
   ├── Static Assets → CDN
   ├── Server → Container Platform
   └── Database → Managed Service
```

## 🧪 テスト戦略

### 現在のテスト構成

```
1. Browser Test Console
   ├── client/public/test-console.html
   ├── client/src/test/gameTest.ts
   ├── client/src/finalValidation.ts
   └── client/src/errorFixes.ts

2. Manual Testing
   ├── Game Functionality
   ├── System Integration
   └── Performance Validation
```

### 将来のテスト拡張

```
1. Unit Tests (Vitest/Jest)
   ├── Game Logic (gameEngine.ts)
   ├── Systems (spell/quest/crafting)
   └── Utilities

2. Integration Tests
   ├── API Endpoints
   ├── Database Operations
   └── System Interactions

3. E2E Tests (Playwright)
   ├── Game Flow
   ├── User Interactions
   └── Cross-browser Compatibility
```

## 📊 パフォーマンス設計

### フロントエンド最適化

```typescript
// React.memo for expensive components
const GameMap = React.memo(({ dungeon, player, monsters }) => {
  // 重い描画処理
});

// useMemo for expensive calculations
const visibleTiles = useMemo(() => {
  return calculateVisibleTiles(player.position, dungeon);
}, [player.position, dungeon]);

// useCallback for stable references
const handleMove = useCallback((direction) => {
  movePlayer(direction);
}, [movePlayer]);
```

### ゲームループ最適化

```typescript
// Efficient state updates
class GameEngine {
  // Immutable updates with structural sharing
  movePlayer(direction: Direction): GameState {
    return {
      ...this.gameState,
      player: {
        ...this.gameState.player,
        position: newPosition,
      },
    };
  }
}
```

### バックエンド最適化

```typescript
// Connection pooling
// Caching strategies
// Efficient database queries
// Request/Response compression
```

## 🔧 開発ツール設定

### TypeScript 設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["client/src/*"],
      "@shared/*": ["shared/*"]
    }
  }
}
```

### Vite 設定

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "client/index.html",
        test: "client/test-console.html",
      },
    },
  },
});
```

## 🚀 スケーラビリティ設計

### 現在の制約

- シングルプレイヤーゲーム
- クライアントサイド状態管理
- ローカルストレージセーブ

### 将来の拡張性

```
1. マルチプレイヤー対応
   ├── WebSocket 通信
   ├── サーバーサイド状態管理
   ├── リアルタイム同期
   └── 競合解決メカニズム

2. マイクロサービス化
   ├── User Service
   ├── Game Service  
   ├── Chat Service
   └── Leaderboard Service

3. データベース分散
   ├── User Data (PostgreSQL)
   ├── Game State (Redis)
   ├── Analytics (ClickHouse)
   └── File Storage (S3)
```

## 📝 設計判断の記録

### なぜ Zustand を選んだか

- Redux の boilerplate が重い
- TypeScript との相性が良い
- シンプルなAPI
- バンドルサイズが小さい

### なぜクライアントサイドゲームロジックか

- レスポンス性の向上
- サーバー負荷の軽減
- オフライン対応の可能性
- NetHack のシングルプレイヤー性質

### なぜ localStorage セーブか

- シンプルな実装
- ユーザープライバシー
- サーバー不要
- 即座のセーブ・ロード

これらの設計判断は、将来の要件変更に応じて見直される可能性があります。
