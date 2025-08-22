// TypeScript テストファイル - ゲームロジックの検証
import { GameEngine } from "../lib/gameEngine";
import { QuestSystem } from "../lib/questSystem";
import { SpellSystem } from "../lib/spellSystem";
import { CraftingSystem } from "../lib/craftingSystem";
import { DungeonGenerator } from "../lib/dungeonGenerator";

// 型エラーの検証
export function validateTypes() {
  console.log("=== 型エラー検証開始 ===");

  try {
    // GameEngine インスタンス化テスト
    const gameEngine = new GameEngine();
    console.log("✅ GameEngine インスタンス化成功");

    // 初期状態の確認
    const gameState = gameEngine.getGameState();
    console.log("✅ ゲーム状態取得成功");

    // プレイヤー移動テスト
    const newState = gameEngine.movePlayer("north");
    console.log("✅ プレイヤー移動処理成功");

    // 魔法システムテスト
    const spellSystem = new SpellSystem();
    const knownSpells = spellSystem.getKnownSpells(["heal"]);
    console.log("✅ 魔法システム処理成功");

    // クエストシステムテスト
    const questSystem = new QuestSystem();
    const availableQuests = questSystem.getAvailableQuests(1);
    console.log("✅ クエストシステム処理成功");

    // 合成システムテスト
    const craftingSystem = new CraftingSystem();
    const recipes = craftingSystem.getAvailableRecipes(1);
    console.log("✅ 合成システム処理成功");

    // ダンジョン生成テスト
    const dungeonGenerator = new DungeonGenerator();
    const dungeon = dungeonGenerator.generateDungeon();
    console.log("✅ ダンジョン生成処理成功");

    return true;
  } catch (error) {
    console.error("❌ 型エラー検証失敗:", error);
    return false;
  }
}

// 関数の互換性テスト
export function testFunctionCompatibility() {
  console.log("\n=== 関数互換性テスト開始 ===");

  try {
    const gameEngine = new GameEngine();

    // ゲーム開始
    const initialState = gameEngine.startNewGame();

    // 魔法詠唱
    const spellResult = gameEngine.castSpell("heal");

    // アイテム合成
    const recipes = gameEngine.getAvailableRecipes();
    if (recipes.length > 0) {
      const craftResult = gameEngine.craftItem(recipes[0].id);
    }

    // クエスト取得
    const availableQuests = gameEngine.getAvailableQuests();
    if (availableQuests.length > 0) {
      const questResult = gameEngine.acceptQuest(availableQuests[0].id);
    }

    // セーブ/ロード
    gameEngine.saveGame();
    const loadedState = gameEngine.loadGame();

    console.log("✅ 全関数互換性テスト成功");
    return true;
  } catch (error) {
    console.error("❌ 関数互換性テスト失敗:", error);
    return false;
  }
}

// 全テスト実行
export function runAllTests() {
  console.log("=== FogueHack TypeScript テスト実行 ===");

  const tests = [
    { name: "型エラー検証", fn: validateTypes },
    { name: "関数互換性", fn: testFunctionCompatibility },
  ];

  let passedTests = 0;
  const results: { name: string; passed: boolean; error?: string }[] = [];

  for (const test of tests) {
    try {
      const passed = test.fn();
      results.push({ name: test.name, passed });
      if (passed) passedTests++;
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log("\n=== テスト結果サマリー ===");
  results.forEach((result) => {
    const status = result.passed ? "✅" : "❌";
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`    エラー: ${result.error}`);
    }
  });

  console.log(`\n合格: ${passedTests}/${tests.length}`);
  console.log(`成功率: ${((passedTests / tests.length) * 100).toFixed(1)}%`);

  return { passedTests, totalTests: tests.length, results };
}

// ブラウザ環境でのテスト実行
if (typeof window !== "undefined") {
  (window as any).runGameTypeScriptTests = runAllTests;
}
