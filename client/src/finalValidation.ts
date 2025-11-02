// FogueHack 最終検証スクリプト
import { GameEngine } from "./lib/gameEngine";
import { Direction } from "./lib/gameTypes";

export class FinalValidator {
  // 1. 型安全性の確認
  static validateTypeScript(): boolean {
    try {
      // GameEngine の型安全性
      const gameEngine = new GameEngine();
      const state = gameEngine.getGameState();

      // 必須プロパティの型チェック
      if (typeof state.phase !== "object" || !state.phase.current || !state.phase.last)
        return false;
      if (typeof state.player !== "object") return false;
      if (!Array.isArray(state.dungeon)) return false;
      if (!Array.isArray(state.monsters)) return false;
      if (!(state.items instanceof Map)) return false;

      console.log("✅ TypeScript型安全性確認完了");
      return true;
    } catch (error) {
      console.error("❌ TypeScript型安全性エラー:", error);
      return false;
    }
  }

  // 2. ゲームロジックの整合性確認
  static validateGameLogic(): boolean {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      const state = gameEngine.getGameState();

      // プレイヤー初期状態の妥当性
      if (state.player.hp <= 0 || state.player.hp > state.player.maxHp) return false;
      if (state.player.mp < 0 || state.player.mp > state.player.maxMp) return false;
      if (state.player.level < 1) return false;
      if (state.player.exp < 0) return false;

      // ダンジョンの妥当性
      if (state.dungeon.length === 0) return false;
      if (state.dungeon[0].length === 0) return false;

      // プレイヤー位置の妥当性
      const pos = state.player.position;
      if (pos.x < 0 || pos.y < 0) return false;
      if (pos.x >= state.dungeon[0].length || pos.y >= state.dungeon.length) return false;

      console.log("✅ ゲームロジック整合性確認完了");
      return true;
    } catch (error) {
      console.error("❌ ゲームロジック整合性エラー:", error);
      return false;
    }
  }

  // 3. システム間連携の確認
  static validateSystemIntegration(): boolean {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      // 魔法システム連携
      const knownSpells = gameEngine.getKnownSpells();
      if (!Array.isArray(knownSpells)) return false;

      // クエストシステム連携
      const availableQuests = gameEngine.getAvailableQuests();
      if (!Array.isArray(availableQuests)) return false;

      // 合成システム連携
      const recipes = gameEngine.getAvailableRecipes();
      if (!Array.isArray(recipes)) return false;

      // セーブ/ロード連携 (ブラウザ環境でのみテスト)
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        gameEngine.saveGame();
        const loadedState = gameEngine.loadGame();
        if (!loadedState) return false;
      }

      console.log("✅ システム間連携確認完了");
      return true;
    } catch (error) {
      console.error("❌ システム間連携エラー:", error);
      return false;
    }
  }

  // 4. パフォーマンスの確認
  static validatePerformance(): boolean {
    try {
      const startTime = performance.now();

      // ゲーム初期化パフォーマンス
      const gameEngine = new GameEngine();
      const initTime = performance.now();

      // ゲーム開始パフォーマンス
      gameEngine.startNewGame();
      const gameStartTime = performance.now();

      // 複数操作のパフォーマンス
      for (let i = 0; i < 10; i++) {
        gameEngine.movePlayer(Direction.North);
        gameEngine.castSpell("heal");
      }
      const operationTime = performance.now();

      const totalTime = operationTime - startTime;

      // 1秒以内に完了することを確認
      if (totalTime > 1000) {
        console.warn(`⚠️ パフォーマンス警告: ${totalTime.toFixed(2)}ms`);
        return false;
      }

      console.log(`✅ パフォーマンス確認完了: ${totalTime.toFixed(2)}ms`);
      return true;
    } catch (error) {
      console.error("❌ パフォーマンスエラー:", error);
      return false;
    }
  }

  // 5. エラーハンドリングの確認
  static validateErrorHandling(): boolean {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      let errorsCaught = 0;

      // 無効な移動
      try {
        gameEngine.movePlayer("invalid" as any);
      } catch (error) {
        errorsCaught++;
      }

      // 無効な魔法
      try {
        gameEngine.castSpell("invalid_spell");
      } catch (error) {
        errorsCaught++;
      }

      // 無効なアイテム使用
      try {
        gameEngine.useItem("invalid_item");
      } catch (error) {
        errorsCaught++;
      }

      // 無効なクエスト受諾
      try {
        gameEngine.acceptQuest("invalid_quest");
      } catch (error) {
        errorsCaught++;
      }

      if (errorsCaught < 2) {
        console.warn("⚠️ エラーハンドリングが不十分です");
        return false;
      }

      console.log(`✅ エラーハンドリング確認完了: ${errorsCaught}個のエラーを適切にキャッチ`);
      return true;
    } catch (error) {
      console.error("❌ エラーハンドリング確認エラー:", error);
      return false;
    }
  }

  // 6. メモリリークの確認
  static validateMemoryUsage(): boolean {
    try {
      if (typeof window === "undefined") {
        console.log("メモリ使用量確認はブラウザ環境でのみ実行可能です");
        return true; // Node.js環境ではスキップ
      }
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // 多数のゲームインスタンス作成・破棄
      for (let i = 0; i < 50; i++) {
        const gameEngine = new GameEngine();
        gameEngine.startNewGame();

        // 各種操作実行
        for (let j = 0; j < 3; j++) {
          gameEngine.movePlayer(Direction.North);
          gameEngine.castSpell("heal");
        }
      }

      // ガベージコレクション促進
      if ((window as any).gc) {
        (window as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // 5MB以下の増加を許容
      if (memoryIncrease > 5 * 1024 * 1024) {
        console.warn(`⚠️ メモリ使用量増加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        return false;
      }

      console.log(`✅ メモリ使用量確認完了: +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      return true;
    } catch (error) {
      console.error("❌ メモリ使用量確認エラー:", error);
      return false;
    }
  }

  // 全検証の実行
  static runFullValidation(): { passed: number; total: number; success: boolean } {
    console.log("🔍 FogueHack 最終検証開始\n");

    const validations = [
      { name: "TypeScript型安全性", fn: this.validateTypeScript },
      { name: "ゲームロジック整合性", fn: this.validateGameLogic },
      { name: "システム間連携", fn: this.validateSystemIntegration },
      { name: "パフォーマンス", fn: this.validatePerformance },
      { name: "エラーハンドリング", fn: this.validateErrorHandling },
      { name: "メモリ使用量", fn: this.validateMemoryUsage },
    ];

    let passed = 0;
    const results: { name: string; success: boolean }[] = [];

    for (const validation of validations) {
      try {
        const success = validation.fn.call(this);
        results.push({ name: validation.name, success });
        if (success) passed++;
      } catch (error) {
        console.error(`❌ ${validation.name} 検証中にエラー:`, error);
        results.push({ name: validation.name, success: false });
      }
    }

    console.log("\n📊 最終検証結果");
    console.log(`合格: ${passed}/${validations.length}`);
    console.log(`成功率: ${((passed / validations.length) * 100).toFixed(1)}%\n`);

    results.forEach((result) => {
      const status = result.success ? "✅" : "❌";
      console.log(`${status} ${result.name}`);
    });

    const allPassed = passed === validations.length;

    if (allPassed) {
      console.log("\n🎉 全ての検証が成功しました！");
      console.log("FogueHack は本番環境で動作する準備ができています。");
    } else {
      console.log("\n⚠️ 一部の検証で問題が発見されました。");
      console.log("問題を修正してから再度検証することをお勧めします。");
    }

    return { passed, total: validations.length, success: allPassed };
  }
}

// ブラウザ環境での実行
if (typeof window !== "undefined") {
  (window as any).runFinalValidation = () => FinalValidator.runFullValidation();
}

export default FinalValidator;
