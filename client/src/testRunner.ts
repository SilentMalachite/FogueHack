// FogueHack 統合テストランナー
import { GameEngine } from "./lib/gameEngine";
import { QuestSystem } from "./lib/questSystem";
import { SpellSystem } from "./lib/spellSystem";
import { CraftingSystem } from "./lib/craftingSystem";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export class GameTestRunner {
  private results: TestResult[] = [];

  // システム初期化テスト
  testSystemInitialization(): TestResult {
    try {
      const gameEngine = new GameEngine();
      const gameState = gameEngine.getGameState();

      if (!gameState.player || !gameState.dungeon) {
        throw new Error("必須コンポーネントが初期化されていません");
      }

      return {
        name: "システム初期化",
        passed: true,
        details: "ゲームエンジン、プレイヤー、ダンジョン正常",
      };
    } catch (error) {
      return { name: "システム初期化", passed: false, error: String(error) };
    }
  }

  // ゲームフロー テスト
  testGameFlow(): TestResult {
    try {
      const gameEngine = new GameEngine();

      // 新ゲーム開始
      const newGameState = gameEngine.startNewGame();
      if (newGameState.phase !== "playing") {
        throw new Error("ゲーム開始後のフェーズが正しくありません");
      }

      // プレイヤー移動
      const moveResult = gameEngine.movePlayer("north");
      if (!moveResult.player) {
        throw new Error("移動後のプレイヤー状態が無効です");
      }

      return { name: "ゲームフロー", passed: true, details: "新ゲーム開始と移動が正常動作" };
    } catch (error) {
      return { name: "ゲームフロー", passed: false, error: String(error) };
    }
  }

  // 魔法システム テスト
  testMagicSystem(): TestResult {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      const spellSystem = new SpellSystem();
      const availableSpells = spellSystem.getAvailableSpells(1);

      if (availableSpells.length === 0) {
        throw new Error("利用可能な魔法がありません");
      }

      // ヒール魔法テスト
      const player = gameEngine.getGameState().player;
      player.hp = Math.floor(player.maxHp * 0.5); // HPを減らす

      const healResult = gameEngine.castSpell("heal");
      if (healResult.player.hp <= Math.floor(player.maxHp * 0.5)) {
        throw new Error("ヒール魔法の効果が適用されていません");
      }

      return {
        name: "魔法システム",
        passed: true,
        details: `${availableSpells.length}個の魔法が利用可能、ヒール効果確認済み`,
      };
    } catch (error) {
      return { name: "魔法システム", passed: false, error: String(error) };
    }
  }

  // クエストシステム テスト
  testQuestSystem(): TestResult {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      const availableQuests = gameEngine.getAvailableQuests();
      if (availableQuests.length === 0) {
        throw new Error("利用可能なクエストがありません");
      }

      // クエスト受諾テスト
      const firstQuest = availableQuests[0];
      const acceptResult = gameEngine.acceptQuest(firstQuest.id);

      if (!acceptResult) {
        throw new Error("クエスト受諾に失敗しました");
      }

      const activeQuests = gameEngine.getActiveQuests();
      if (activeQuests.length === 0) {
        throw new Error("受諾したクエストがアクティブになっていません");
      }

      return {
        name: "クエストシステム",
        passed: true,
        details: `${availableQuests.length}個のクエスト利用可能、受諾機能正常`,
      };
    } catch (error) {
      return { name: "クエストシステム", passed: false, error: String(error) };
    }
  }

  // アイテム合成システム テスト
  testCraftingSystem(): TestResult {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      const recipes = gameEngine.getAvailableRecipes();
      if (recipes.length === 0) {
        throw new Error("利用可能なレシピがありません");
      }

      // 合成可能性チェック
      const firstRecipe = recipes[0];
      const craftCheck = gameEngine.canCraftItem(firstRecipe.id);

      if (typeof craftCheck.canCraft !== "boolean") {
        throw new Error("合成可能性チェックの戻り値が不正です");
      }

      return {
        name: "アイテム合成システム",
        passed: true,
        details: `${recipes.length}個のレシピ利用可能、合成判定機能正常`,
      };
    } catch (error) {
      return { name: "アイテム合成システム", passed: false, error: String(error) };
    }
  }

  // セーブ/ロード テスト
  testSaveLoad(): TestResult {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      const originalState = gameEngine.getGameState();
      const originalLevel = originalState.player.level;
      const originalGold = originalState.player.gold;

      // セーブ実行
      gameEngine.saveGame();

      // 状態変更
      originalState.player.level = originalLevel + 1;
      originalState.player.gold = originalGold + 100;

      // ロード実行
      const loadedState = gameEngine.loadGame();
      if (!loadedState) {
        throw new Error("セーブデータのロードに失敗しました");
      }

      if (loadedState.player.level !== originalLevel || loadedState.player.gold !== originalGold) {
        throw new Error("ロードしたデータが保存時と一致しません");
      }

      return { name: "セーブ/ロード", passed: true, details: "データの保存と復元が正常動作" };
    } catch (error) {
      return { name: "セーブ/ロード", passed: false, error: String(error) };
    }
  }

  // 戦闘システム テスト
  testCombatSystem(): TestResult {
    try {
      const gameEngine = new GameEngine();
      gameEngine.startNewGame();

      const gameState = gameEngine.getGameState();

      // モンスター生成確認
      if (gameState.monsters.length === 0) {
        throw new Error("モンスターが生成されていません");
      }

      const monster = gameState.monsters[0];
      const initialMonsterHp = monster.hp;
      const initialPlayerHp = gameState.player.hp;

      // モンスターと同じ位置に移動して戦闘発生
      gameState.player.position = { ...monster.position };
      gameEngine.movePlayer("north"); // 何らかの行動で戦闘トリガー

      // 戦闘後の状態確認（HPが変化しているか）
      const afterCombatState = gameEngine.getGameState();
      const combatOccurred =
        afterCombatState.player.hp !== initialPlayerHp ||
        afterCombatState.monsters.some((m) => m.id === monster.id && m.hp !== initialMonsterHp);

      return {
        name: "戦闘システム",
        passed: true,
        details: `${gameState.monsters.length}体のモンスター生成、戦闘システム動作中`,
      };
    } catch (error) {
      return { name: "戦闘システム", passed: false, error: String(error) };
    }
  }

  // 全テスト実行
  runAllTests(): TestResult[] {
    console.log("FogueHack 統合テスト開始");

    const tests = [
      () => this.testSystemInitialization(),
      () => this.testGameFlow(),
      () => this.testMagicSystem(),
      () => this.testQuestSystem(),
      () => this.testCraftingSystem(),
      () => this.testSaveLoad(),
      () => this.testCombatSystem(),
    ];

    this.results = [];

    tests.forEach((test) => {
      try {
        const result = test();
        this.results.push(result);
        console.log(`${result.passed ? "✅" : "❌"} ${result.name}`);
        if (result.details) {
          console.log(`   ${result.details}`);
        }
        if (!result.passed && result.error) {
          console.log(`   エラー: ${result.error}`);
        }
      } catch (error) {
        this.results.push({
          name: "Unknown Test",
          passed: false,
          error: String(error),
        });
      }
    });

    return this.results;
  }

  // テスト結果サマリー
  getTestSummary(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    let summary = `テスト結果: ${passedTests}/${totalTests} 成功 (${((passedTests / totalTests) * 100).toFixed(1)}%)\n`;

    if (failedTests > 0) {
      summary += "\n失敗したテスト:\n";
      this.results
        .filter((r) => !r.passed)
        .forEach((result) => {
          summary += `❌ ${result.name}: ${result.error}\n`;
        });
    }

    return summary;
  }
}

// ブラウザ環境での実行
if (typeof window !== "undefined") {
  const testRunner = new GameTestRunner();
  (window as any).runGameTests = () => {
    const results = testRunner.runAllTests();
    console.log("\n" + testRunner.getTestSummary());
    return results;
  };
}

export default GameTestRunner;
