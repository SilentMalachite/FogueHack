// FogueHack ゲーム統合テスト
// このテストはブラウザのコンソールで実行されることを想定しています

console.log("=== FogueHack ゲームテスト開始 ===");

// 基本的なゲーム機能のテスト
function testGameBasics() {
  console.log("\n1. 基本機能テスト");

  try {
    // ゲーム状態の取得
    const gameState = window.useGameState?.getState?.();
    if (!gameState) {
      console.error("❌ ゲーム状態を取得できません");
      return false;
    }
    console.log("✅ ゲーム状態取得成功");

    // ゲームエンジンの確認
    if (!gameState.gameEngine) {
      console.error("❌ ゲームエンジンが見つかりません");
      return false;
    }
    console.log("✅ ゲームエンジン確認完了");

    return true;
  } catch (error) {
    console.error("❌ 基本機能テストエラー:", error);
    return false;
  }
}

// 新しいゲーム開始テスト
function testNewGame() {
  console.log("\n2. 新ゲーム開始テスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    // 新ゲーム開始
    gameState.startNewGame();

    const newState = gameState;
    if (newState.phase !== "playing") {
      console.error("❌ ゲームフェーズが正しくありません:", newState.phase);
      return false;
    }

    if (!newState.player) {
      console.error("❌ プレイヤーが作成されていません");
      return false;
    }

    console.log("✅ プレイヤー作成完了");
    console.log("  - HP:", newState.player.hp, "/", newState.player.maxHp);
    console.log("  - MP:", newState.player.mp, "/", newState.player.maxMp);
    console.log("  - レベル:", newState.player.level);
    console.log("  - ゴールド:", newState.player.gold);

    return true;
  } catch (error) {
    console.error("❌ 新ゲーム開始テストエラー:", error);
    return false;
  }
}

// プレイヤー移動テスト
function testPlayerMovement() {
  console.log("\n3. プレイヤー移動テスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    const initialPos = { ...gameState.player.position };
    console.log("初期位置:", initialPos);

    // 各方向への移動をテスト
    const directions = ["north", "south", "east", "west"];
    let moveCount = 0;

    for (const direction of directions) {
      try {
        gameState.movePlayer(direction);
        moveCount++;
        console.log(`✅ ${direction}方向への移動成功`);
      } catch (error) {
        console.log(`⚠️ ${direction}方向への移動失敗 (壁かもしれません):`, error.message);
      }
    }

    if (moveCount > 0) {
      console.log(`✅ ${moveCount}/4方向の移動テスト完了`);
      return true;
    } else {
      console.error("❌ 全方向への移動が失敗しました");
      return false;
    }
  } catch (error) {
    console.error("❌ プレイヤー移動テストエラー:", error);
    return false;
  }
}

// 魔法システムテスト
function testMagicSystem() {
  console.log("\n4. 魔法システムテスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    // 習得済み魔法の確認
    const knownSpells = gameState.getKnownSpells();
    console.log("習得済み魔法数:", knownSpells.length);

    if (knownSpells.length === 0) {
      console.log("⚠️ 習得済み魔法がありません");
      return true; // エラーではない
    }

    // ヒール魔法のテスト
    try {
      const initialHp = gameState.player.hp;
      gameState.castHeal();
      console.log("✅ ヒール魔法詠唱成功");
    } catch (error) {
      console.log("⚠️ ヒール魔法詠唱失敗:", error.message);
    }

    // 攻撃魔法のテスト
    try {
      gameState.castFireball();
      console.log("✅ ファイアボール魔法詠唱成功");
    } catch (error) {
      console.log("⚠️ ファイアボール魔法詠唱失敗:", error.message);
    }

    return true;
  } catch (error) {
    console.error("❌ 魔法システムテストエラー:", error);
    return false;
  }
}

// アイテム合成システムテスト
function testCraftingSystem() {
  console.log("\n5. アイテム合成システムテスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    // 利用可能なレシピの確認
    const recipes = gameState.getAvailableRecipes();
    console.log("利用可能レシピ数:", recipes.length);

    if (recipes.length === 0) {
      console.log("⚠️ 利用可能なレシピがありません");
      return true;
    }

    // 最初のレシピで合成テスト
    const firstRecipe = recipes[0];
    console.log("テスト対象レシピ:", firstRecipe.result.name);

    const craftCheck = gameState.canCraftItem(firstRecipe.id);
    console.log("合成可能:", craftCheck.canCraft);

    if (!craftCheck.canCraft) {
      console.log("不足素材:", craftCheck.missing.join(", "));
    }

    return true;
  } catch (error) {
    console.error("❌ アイテム合成システムテストエラー:", error);
    return false;
  }
}

// クエストシステムテスト
function testQuestSystem() {
  console.log("\n6. クエストシステムテスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    // 利用可能なクエストの確認
    const availableQuests = gameState.getAvailableQuests();
    const activeQuests = gameState.getActiveQuests();
    const completedQuests = gameState.getCompletedQuests();

    console.log("利用可能クエスト数:", availableQuests.length);
    console.log("進行中クエスト数:", activeQuests.length);
    console.log("完了済みクエスト数:", completedQuests.length);

    // 最初のクエストを受諾してみる
    if (availableQuests.length > 0) {
      const firstQuest = availableQuests[0];
      console.log("テスト対象クエスト:", firstQuest.title);

      const success = gameState.acceptQuest(firstQuest.id);
      if (success) {
        console.log("✅ クエスト受諾成功");
      } else {
        console.log("⚠️ クエスト受諾失敗");
      }
    }

    return true;
  } catch (error) {
    console.error("❌ クエストシステムテストエラー:", error);
    return false;
  }
}

// セーブ/ロードシステムテスト
function testSaveLoadSystem() {
  console.log("\n7. セーブ/ロードシステムテスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    // セーブテスト
    const beforeSave = {
      level: gameState.player.level,
      hp: gameState.player.hp,
      gold: gameState.player.gold,
      phase: gameState.phase,
    };

    gameState.saveGame();
    console.log("✅ セーブ実行完了");

    // ロードテスト
    gameState.loadGame();
    console.log("✅ ロード実行完了");

    const afterLoad = {
      level: gameState.player.level,
      hp: gameState.player.hp,
      gold: gameState.player.gold,
      phase: gameState.phase,
    };

    // データの整合性確認
    const dataConsistent =
      beforeSave.level === afterLoad.level &&
      beforeSave.hp === afterLoad.hp &&
      beforeSave.gold === afterLoad.gold &&
      beforeSave.phase === afterLoad.phase;

    if (dataConsistent) {
      console.log("✅ セーブ/ロードデータ整合性確認完了");
    } else {
      console.log("⚠️ セーブ/ロードデータに差異があります");
      console.log("保存前:", beforeSave);
      console.log("読込後:", afterLoad);
    }

    return true;
  } catch (error) {
    console.error("❌ セーブ/ロードシステムテストエラー:", error);
    return false;
  }
}

// UIコンポーネントテスト
function testUIComponents() {
  console.log("\n8. UIコンポーネントテスト");

  try {
    // DOM要素の存在確認
    const gameContainer = document.querySelector(".w-full.h-screen");
    if (!gameContainer) {
      console.error("❌ ゲームコンテナが見つかりません");
      return false;
    }
    console.log("✅ ゲームコンテナ確認完了");

    // ゲームメニューの確認
    const gameMenu = document.querySelector("button");
    if (gameMenu) {
      console.log("✅ ゲームメニューボタン確認完了");
    }

    return true;
  } catch (error) {
    console.error("❌ UIコンポーネントテストエラー:", error);
    return false;
  }
}

// エラー処理テスト
function testErrorHandling() {
  console.log("\n9. エラー処理テスト");

  try {
    const gameState = window.useGameState?.getState?.();
    if (!gameState) return false;

    // 無効な方向への移動
    try {
      gameState.movePlayer("invalid_direction");
      console.log("⚠️ 無効な方向への移動が成功してしまいました");
    } catch (error) {
      console.log("✅ 無効な方向への移動は正しく拒否されました");
    }

    // 無効なアイテム使用
    try {
      gameState.useItem("invalid_item_id");
      console.log("⚠️ 無効なアイテム使用が成功してしまいました");
    } catch (error) {
      console.log("✅ 無効なアイテム使用は正しく拒否されました");
    }

    return true;
  } catch (error) {
    console.error("❌ エラー処理テストエラー:", error);
    return false;
  }
}

// 全テストの実行
function runAllTests() {
  console.log("=== FogueHack 総合テスト実行 ===");

  const tests = [
    { name: "基本機能", fn: testGameBasics },
    { name: "新ゲーム開始", fn: testNewGame },
    { name: "プレイヤー移動", fn: testPlayerMovement },
    { name: "魔法システム", fn: testMagicSystem },
    { name: "アイテム合成", fn: testCraftingSystem },
    { name: "クエストシステム", fn: testQuestSystem },
    { name: "セーブ/ロード", fn: testSaveLoadSystem },
    { name: "UIコンポーネント", fn: testUIComponents },
    { name: "エラー処理", fn: testErrorHandling },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      if (test.fn()) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name}テストで予期しないエラー:`, error);
    }
  }

  console.log("\n=== テスト結果サマリー ===");
  console.log(`合格: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log("🎉 全テスト合格！");
  } else {
    console.log("⚠️ 一部のテストで問題が発見されました");
  }
}

// テスト実行用の関数をグローバルに登録
window.runGameTests = runAllTests;

console.log("テストが準備できました。以下のコマンドでテストを実行してください:");
console.log("runGameTests()");
