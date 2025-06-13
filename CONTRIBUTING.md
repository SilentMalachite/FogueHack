# 🤝 FogueHack への貢献

FogueHackプロジェクトへの貢献をご検討いただき、ありがとうございます！このガイドでは、プロジェクトに効果的に貢献する方法について説明します。

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- Git

### セットアップ手順

```bash
# 1. リポジトリをフォーク・クローン
git clone https://github.com/yourusername/FogueHack.git
cd FogueHack

# 2. 依存関係をインストール
npm install

# 3. 開発サーバーを起動
npm run dev

# 4. テストコンソールでシステム確認
# ブラウザで http://localhost:5000/test-console.html にアクセス
```

## 📋 貢献の種類

### 🐛 バグ報告
- 明確で再現可能な手順を提供
- 期待される動作と実際の動作を記述
- 可能であればスクリーンショットを添付

### ✨ 機能リクエスト
- 提案する機能の明確な説明
- 使用ケースと利益の説明
- 可能であれば実装案を提示

### 🔧 コードの貢献
- バグ修正
- 新機能の実装
- パフォーマンス改善
- テストの追加

### 📚 ドキュメントの改善
- README.mdの更新
- コードコメントの改善
- チュートリアルの作成

## 🔄 貢献のワークフロー

### 1. Issue の確認・作成
- 既存のIssueを確認
- 新しいIssueを作成（必要に応じて）
- Issue番号を記録

### 2. ブランチの作成
```bash
# メインブランチから最新をプル
git checkout main
git pull origin main

# 機能ブランチを作成
git checkout -b feature/issue-123-new-spell-system
# または
git checkout -b bugfix/issue-456-combat-calculation
```

### 3. 開発とテスト
```bash
# 変更を実装
# ファイルを編集...

# テストを実行
npm run test
# または http://localhost:5000/test-console.html でブラウザテスト

# 動作確認
npm run dev
```

### 4. コミットとプッシュ
```bash
# 変更をステージング
git add .

# わかりやすいコミットメッセージ
git commit -m "feat: 新しい雷魔法システムを追加 (closes #123)"

# リモートにプッシュ
git push origin feature/issue-123-new-spell-system
```

### 5. Pull Request の作成
- GitHub上でPull Requestを作成
- 変更内容の詳細な説明
- 関連するIssue番号を記載
- テスト結果を含める

## 🎯 コーディング規約

### TypeScript
```typescript
// ✅ 良い例
interface Player {
  hp: number;
  maxHp: number;
  position: Position;
}

function movePlayer(direction: Direction): GameState {
  // 実装
}

// ❌ 悪い例
function move(d: any): any {
  // 実装
}
```

### ファイル構造
```
client/src/
├── components/          # Reactコンポーネント
│   ├── GameComponent.tsx
│   └── index.ts
├── lib/                # ゲームロジック
│   ├── gameEngine.ts   # メインエンジン
│   ├── systems/        # 各種システム
│   └── types/          # 型定義
└── hooks/              # カスタムフック
```

### 命名規則
- **コンポーネント**: PascalCase (`GameMenu.tsx`)
- **関数**: camelCase (`movePlayer`)
- **定数**: UPPER_SNAKE_CASE (`MAX_HP`)
- **インターface**: PascalCase (`GameState`)

### コメント
```typescript
// 日本語でのコメントを推奨
/**
 * プレイヤーを指定された方向に移動させる
 * @param direction - 移動方向
 * @returns 更新されたゲーム状態
 */
function movePlayer(direction: Direction): GameState {
  // 実装...
}
```

## 🧪 テストガイドライン

### テストの実行
```bash
# ブラウザベースのテストコンソール
# http://localhost:5000/test-console.html

# 個別システムテスト
npm run test:magic      # 魔法システム
npm run test:quest      # クエストシステム
npm run test:crafting   # 合成システム
```

### テストの追加
新機能には必ずテストを追加してください：

```typescript
// client/src/test/newFeature.test.ts
import { GameEngine } from '../lib/gameEngine';

describe('新機能テスト', () => {
  test('基本動作確認', () => {
    const game = new GameEngine();
    // テスト実装
  });
});
```

## 🎮 ゲームデザイン原則

### ASCII美学の維持
- ASCIIキャラクターのみ使用
- NetHackスタイルの視覚表現
- 色使いは最小限に抑制

### 日本語対応
- 全てのユーザー向けテキストは日本語
- エラーメッセージも日本語
- コメントは日本語推奨

### パフォーマンス
- ブラウザでの軽快な動作
- メモリリークの防止
- 大きなファイルサイズの回避

## 📝 Pull Request チェックリスト

提出前に以下を確認してください：

- [ ] 全てのテストが通過
- [ ] TypeScriptエラーがない
- [ ] 新機能にはテストを追加
- [ ] ドキュメントを更新（必要に応じて）
- [ ] 日本語の対応を確認
- [ ] パフォーマンスに悪影響がない
- [ ] ゲームバランスを考慮

## 🆘 ヘルプとサポート

### 質問や相談
- **GitHub Discussions**: 一般的な質問
- **GitHub Issues**: バグ報告や機能リクエスト
- **コードレビュー**: Pull Requestでのフィードバック

### 参考資料
- [NetHack Wiki](https://nethackwiki.com/) - ゲームデザインの参考
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript学習
- [React Documentation](https://react.dev/) - React学習

## 🎖️ 貢献者の認定

貢献いただいた方は以下の形で認定されます：

### レベル1: 初回貢献者
- 1つ以上のPull Requestがマージされた方
- README.mdの貢献者セクションに記載

### レベル2: 継続貢献者
- 5つ以上のPull Requestがマージされた方
- プロジェクトメンバーへの招待

### レベル3: コアコントリビューター
- 10以上の重要な貢献をされた方
- プロジェクトの方向性についての意思決定に参加

## 🏆 貢献のアイデア

### 初心者向け
- [ ] タイポ修正
- [ ] ドキュメントの改善
- [ ] 新しい魔法の追加
- [ ] UIの改善

### 中級者向け
- [ ] 新しいクエストタイプ
- [ ] パフォーマンス最適化
- [ ] テストカバレッジの向上
- [ ] アイテムバランス調整

### 上級者向け
- [ ] マルチプレイヤーサポート
- [ ] データベース統合
- [ ] リアルタイム同期
- [ ] モバイル対応

## 📄 ライセンス

貢献されたコードは、プロジェクトのMITライセンスの下で公開されることに同意したものとみなされます。

---

**FogueHack**への貢献をお待ちしています！質問があれば遠慮なくお聞かせください。